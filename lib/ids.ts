const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

function encode(value: bigint, length: number): string {
  let current = value;
  let result = "";
  for (let index = 0; index < length; index += 1) {
    result = CROCKFORD[Number(current & 31n)] + result;
    current >>= 5n;
  }
  return result;
}

export function createPublicId(now = Date.now()): string {
  const timestamp = encode(BigInt(now), 10);
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  let random = 0n;
  for (const byte of bytes) random = (random << 8n) | BigInt(byte);
  return timestamp + encode(random, 16);
}

