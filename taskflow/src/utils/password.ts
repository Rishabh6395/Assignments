import bcrypt from 'bcrypt';
import { env } from '../config/env';

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, env.bcryptCostFactor);
}

export async function comparePassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}
