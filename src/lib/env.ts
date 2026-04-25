import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_GO_API_URL: z.string().url(),
});

export const env = clientEnvSchema.parse({
  NEXT_PUBLIC_GO_API_URL: process.env.NEXT_PUBLIC_GO_API_URL,
});
