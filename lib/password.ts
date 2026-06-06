// lib/password.ts
// Password and OTP hashing helpers based on Node's built-in scrypt.

import { randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export async function hashSecret(secret: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(secret, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifySecret(secret: string, hash: string | null | undefined) {
  if (!hash) return false;

  const [salt, stored] = hash.split(":");
  if (!salt || !stored) return false;

  const derived = (await scrypt(secret, salt, KEY_LENGTH)) as Buffer;
  const storedBuffer = Buffer.from(stored, "hex");

  if (storedBuffer.length !== derived.length) return false;
  return timingSafeEqual(storedBuffer, derived);
}

export function createOtpCode() {
  return String(randomInt(100000, 1000000));
}
