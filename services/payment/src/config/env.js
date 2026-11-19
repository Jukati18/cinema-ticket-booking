import { z } from 'zod';

// Env is validated at startup (fail fast). Add new variables to the schema AND to .env.example.
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3002),
  SERVICE_NAME: z.string().default('payment'),
});

export const env = schema.parse(process.env);
