import { z } from "zod";

export const createPropertySchema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().max(5000).optional(),
  address_line1: z.string().min(3),
  address_line2: z.string().optional(),
  city: z.string().min(2),
  district: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  total_rooms: z.number().int().min(1),
});

export const updatePropertySchema = createPropertySchema.partial().extend({
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const createUnitSchema = z.object({
  name: z.string().min(1).max(100),
  unit_type: z.enum(["full_room", "bed_space"]),
  price_per_month: z.number().positive(),
  total_capacity: z.number().int().min(1),
  gender_restriction: z.enum(["male", "female", "any"]).default("any"),
  available_from: z.string().optional(),
  description: z.string().max(2000).optional(),
});

export const updateUnitSchema = createUnitSchema.partial().extend({
  is_available: z.boolean().optional(),
});
