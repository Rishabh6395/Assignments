import { hashPassword, comparePassword } from '../../src/utils/password';
import {
  signAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  hashToken,
  refreshTokenExpiryDate
} from '../../src/utils/jwt';

describe('password hashing', () => {
  it('hashes a password using bcrypt (cost factor >= 12) and never stores it in plaintext', async () => {
    const hash = await hashPassword('SuperSecret123!');
    expect(hash).not.toBe('SuperSecret123!');
    expect(hash).toMatch(/^\$2[aby]\$(\d{2})\$/);
    const cost = parseInt(hash.split('$')[2], 10);
    expect(cost).toBeGreaterThanOrEqual(12);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    await expect(comparePassword('correct-horse-battery-staple', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('produces a different hash for the same password each time (salted)', async () => {
    const hash1 = await hashPassword('same-password');
    const hash2 = await hashPassword('same-password');
    expect(hash1).not.toBe(hash2);
  });
});

describe('access token (JWT)', () => {
  it('signs a token that can be verified and yields the original payload', () => {
    const token = signAccessToken({ sub: 'user-123', email: 'alice@acme.test' });
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe('user-123');
    expect(decoded.email).toBe('alice@acme.test');
  });

  it('rejects a tampered token', () => {
    const token = signAccessToken({ sub: 'user-123', email: 'alice@acme.test' });
    const tampered = token.slice(0, -2) + 'xx';
    expect(() => verifyAccessToken(tampered)).toThrow();
  });

  it('rejects a garbage token', () => {
    expect(() => verifyAccessToken('not.a.jwt')).toThrow();
  });
});

describe('refresh tokens', () => {
  it('generates a long random opaque token (not a JWT)', () => {
    const token = generateRefreshToken();
    expect(token.length).toBeGreaterThanOrEqual(64);
    expect(token.split('.').length).toBe(1);
  });

  it('generates unique tokens on each call', () => {
    const a = generateRefreshToken();
    const b = generateRefreshToken();
    expect(a).not.toBe(b);
  });

  it('hashes tokens deterministically so lookups by hash work', () => {
    const token = generateRefreshToken();
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashToken(token)).not.toBe(token);
  });

  it('sets an expiry roughly N days in the future', () => {
    const expiry = refreshTokenExpiryDate();
    const daysFromNow = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    expect(daysFromNow).toBeGreaterThan(6.9);
    expect(daysFromNow).toBeLessThan(7.1);
  });
});
