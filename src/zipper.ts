const encoder = new TextEncoder();

function writeUInt16LE(buffer: Uint8Array, offset: number, value: number): void {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
}

function writeUInt32LE(buffer: Uint8Array, offset: number, value: number): void {
  buffer[offset] = value & 0xff;
  buffer[offset + 1] = (value >>> 8) & 0xff;
  buffer[offset + 2] = (value >>> 16) & 0xff;
  buffer[offset + 3] = (value >>> 24) & 0xff;
}

export function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

export function createZip(fileName: string, content: Uint8Array): Uint8Array {
  const fileNameBytes = encoder.encode(fileName);
  const checksum = crc32(content);
  const dosTime = 0;
  const dosDate = 33;
  const localHeaderLength = 30 + fileNameBytes.length;
  const centralHeaderLength = 46 + fileNameBytes.length;
  const endRecordLength = 22;
  const totalLength = localHeaderLength + content.length + centralHeaderLength + endRecordLength;
  const zip = new Uint8Array(totalLength);
  let offset = 0;

  writeUInt32LE(zip, offset, 0x04034b50);
  writeUInt16LE(zip, offset + 4, 20);
  writeUInt16LE(zip, offset + 6, 0);
  writeUInt16LE(zip, offset + 8, 0);
  writeUInt16LE(zip, offset + 10, dosTime);
  writeUInt16LE(zip, offset + 12, dosDate);
  writeUInt32LE(zip, offset + 14, checksum);
  writeUInt32LE(zip, offset + 18, content.length);
  writeUInt32LE(zip, offset + 22, content.length);
  writeUInt16LE(zip, offset + 26, fileNameBytes.length);
  writeUInt16LE(zip, offset + 28, 0);
  zip.set(fileNameBytes, offset + 30);
  offset += localHeaderLength;

  zip.set(content, offset);
  offset += content.length;

  const centralDirectoryOffset = offset;
  writeUInt32LE(zip, offset, 0x02014b50);
  writeUInt16LE(zip, offset + 4, 20);
  writeUInt16LE(zip, offset + 6, 20);
  writeUInt16LE(zip, offset + 8, 0);
  writeUInt16LE(zip, offset + 10, 0);
  writeUInt16LE(zip, offset + 12, dosTime);
  writeUInt16LE(zip, offset + 14, dosDate);
  writeUInt32LE(zip, offset + 16, checksum);
  writeUInt32LE(zip, offset + 20, content.length);
  writeUInt32LE(zip, offset + 24, content.length);
  writeUInt16LE(zip, offset + 28, fileNameBytes.length);
  writeUInt16LE(zip, offset + 30, 0);
  writeUInt16LE(zip, offset + 32, 0);
  writeUInt16LE(zip, offset + 34, 0);
  writeUInt16LE(zip, offset + 36, 0);
  writeUInt32LE(zip, offset + 38, 0);
  writeUInt32LE(zip, offset + 42, 0);
  zip.set(fileNameBytes, offset + 46);
  offset += centralHeaderLength;

  writeUInt32LE(zip, offset, 0x06054b50);
  writeUInt16LE(zip, offset + 4, 0);
  writeUInt16LE(zip, offset + 6, 0);
  writeUInt16LE(zip, offset + 8, 1);
  writeUInt16LE(zip, offset + 10, 1);
  writeUInt32LE(zip, offset + 12, centralHeaderLength);
  writeUInt32LE(zip, offset + 16, centralDirectoryOffset);
  writeUInt16LE(zip, offset + 20, 0);

  return zip;
}