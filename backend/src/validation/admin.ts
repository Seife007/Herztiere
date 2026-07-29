import { z } from 'zod'

const pageSchema = z.coerce.number().int().min(1).default(1)
const pageSizeSchema = z.coerce.number().int().min(1).max(100).default(20)

export const adminUserListQuerySchema = z.object({
  search: z.string().trim().max(255).optional(),
  role: z.enum(['user', 'admin']).optional(),
  status: z.enum(['active', 'blocked']).optional(),
  page: pageSchema,
  pageSize: pageSizeSchema,
})

export const updateUserRoleSchema = z.object({
  role: z.enum(['user', 'admin']),
})

export const updateUserBlockedSchema = z.object({
  isBlocked: z.boolean(),
})

export const adminAnimalListQuerySchema = z.object({
  status: z.enum(['active', 'adopted', 'removed']).optional(),
  category: z.string().trim().max(100).optional(),
  search: z.string().trim().max(255).optional(),
  syncedBefore: z.string().datetime().optional(),
  page: pageSchema,
  pageSize: pageSizeSchema,
})

export const updateAnimalOverridesSchema = z.object({
  overrides: z.record(z.string(), z.unknown()),
  isHidden: z.boolean(),
})
