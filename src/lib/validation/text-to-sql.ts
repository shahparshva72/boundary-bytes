import { z } from 'zod';

// Input validation schema for text-to-SQL requests
export const TextToSqlRequestSchema = z.object({
  question: z
    .string()
    .min(1, 'Question cannot be empty')
    .max(500, 'Question is too long')
    .refine(
      // eslint-disable-next-line no-useless-escape
      (val) => /^[a-zA-Z0-9\s?.,\-'"()\/:%+&]+$/.test(val),
      'Question contains invalid characters. Only letters, numbers, spaces, parentheses, and common punctuation are allowed.',
    ),
});

// Type inference from schema
export type TextToSqlRequest = z.infer<typeof TextToSqlRequestSchema>;

// Input sanitization function
export function sanitizeInput(input: string): string {
  return input
    .trim()
    // eslint-disable-next-line no-useless-escape
    .replace(/[^\w\s?.,\-'"()\/:%+&]/g, '')
    .replace(/\s+/g, ' '); // Normalize whitespace
}

// Validation helper function
export function validateTextToSqlRequest(data: unknown):
  | {
      success: true;
      data: TextToSqlRequest;
    }
  | {
      success: false;
      error: string;
    } {
  try {
    const result = TextToSqlRequestSchema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return { success: false, error: firstError.message };
    }
    return { success: false, error: 'Invalid request format' };
  }
}
