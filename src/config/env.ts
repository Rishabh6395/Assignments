import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isTest: process.env.NODE_ENV === 'test',
  port: parseInt(process.env.PORT ?? '3000', 10),

  databaseUrl:
    process.env.NODE_ENV === 'test'
      ? required('DATABASE_URL_TEST', process.env.DATABASE_URL)
      : required('DATABASE_URL'),

  redisHost: process.env.REDIS_HOST ?? 'localhost',
  redisPort: parseInt(process.env.REDIS_PORT ?? '6379', 10),

  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'dev_access_secret'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev_refresh_secret'),
  jwtAccessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
  jwtRefreshTtlDays: parseInt(process.env.JWT_REFRESH_TTL_DAYS ?? '7', 10),

  bcryptCostFactor: parseInt(process.env.BCRYPT_COST_FACTOR ?? '12', 10),

  emailFrom: process.env.EMAIL_FROM ?? 'notifications@taskflow.dev'
};
