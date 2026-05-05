import { z } from "zod";

export const createSlotSchema = z
  .object({
    property_id: z.string().uuid(),
    slot_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    start_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    end_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
    max_viewers: z.number().int().min(1).max(10).default(1),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const slotDate = new Date(data.slot_date);
      return slotDate >= today;
    },
    {
      message: "Slot date must be today or in the future",
      path: ["slot_date"],
    }
  )
  .refine(
    (data) => {
      const [startH, startM] = data.start_time.split(":").map(Number);
      const [endH, endM] = data.end_time.split(":").map(Number);
      return endH > startH || (endH === startH && endM > startM);
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

export const createBookingSchema = z.object({
  slot_id: z.string().uuid(),
  property_id: z.string().uuid(),
  unit_id: z.string().uuid().optional(),
  renter_notes: z.string().max(500).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum([
    "confirmed",
    "declined",
    "cancelled_by_renter",
    "cancelled_by_landlord",
    "completed",
    "no_show",
  ]),
  cancellation_reason: z.string().max(500).optional(),
});
