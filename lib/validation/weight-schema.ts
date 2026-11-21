import { z } from 'zod';

export const weightEntrySchema = z.object({
  weight_kg: z
    .number({
      error: 'Please enter a valid weight in kilograms',
    })
    .min(30, 'Weight must be at least 30 kg')
    .max(300, 'Weight must be at most 300 kg'),
  recorded_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
    .optional(),
  notes: z
    .string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable(),
});

export type WeightEntryInput = z.infer<typeof weightEntrySchema>;
