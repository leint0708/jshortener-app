import { z } from "zod"
import { RESERVED_PATHS } from "@/config/constants"

// Validation schemas (single source of truth for both client and server)
export const createInput = z.object({
    originalUrl: z.url('Invalid URL format'),
    title: z.string().optional(),
    customAlias: z.string()
        .min(3, 'Alias must be at least 3 characters')
        .max(20, 'Alias must be at most 20 characters')
        .regex(/^[a-zA-Z0-9-_]+$/, 'Alias can only contain letters, numbers, hyphens, and underscores')
        .refine((val) => !RESERVED_PATHS.includes(val), {
            message: 'This alias is reserved for system use',
        })
        .optional()
        .or(z.literal('')),
    expiresAt: z.string().optional(), // ISO string date
})

export const updateInput = createInput.partial().extend({
    id: z.string(),
    isActive: z.boolean().optional(),
})

// Infer types for use in components
export type CreateInput = z.infer<typeof createInput>
export type UpdateInput = z.infer<typeof updateInput>
