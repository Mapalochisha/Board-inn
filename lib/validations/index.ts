import { z } from 'zod'

// Example schema
export const profileSchema = z.object({
  fullName: z.string().min(2),
})
