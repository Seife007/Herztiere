import { z } from 'zod'

export const preferencesSchema = z.object({
  speciesInterest: z.array(z.string()).default([]),
  experienceLevel: z.enum(['keine', 'etwas', 'erfahren']).optional(),
  housingSituation: z.string().max(200).optional(),
})

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(10).max(200),
  preferences: preferencesSchema.optional().default({ speciesInterest: [] }),
})

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(200),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(10).max(200),
})

export const updatePreferencesSchema = z.object({
  preferences: preferencesSchema,
})
