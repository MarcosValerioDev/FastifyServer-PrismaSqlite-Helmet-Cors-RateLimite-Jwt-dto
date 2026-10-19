import { config } from 'dotenv';

config({ quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

function toNumber(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (Number.isNaN(value)) {
    throw new Error(`Variável de ambiente ${name} deve ser numérica`);
  }
  return value;
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const jwtSecret = required('JWT_SECRET');

if (nodeEnv === 'production' && jwtSecret.length < 32) {
  throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres em produção');
}

export const env = {
  NODE_ENV: nodeEnv,
  HOST: process.env.HOST ?? '0.0.0.0',
  PORT: toNumber('PORT', 3333),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: jwtSecret,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '1d',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
  RATE_LIMIT_MAX: toNumber('RATE_LIMIT_MAX', 100),
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW ?? '1 minute',
} as const;

export const isProduction = env.NODE_ENV === 'production';
