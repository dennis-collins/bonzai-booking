import { z } from "zod";

export const BookingSchema = z.enum(["Enkelrum", "Dubbelrum", "Svit"]);

export const CreateBookinginputSchema = z.object({
  guestName: z.string().min(1),
  guestEmail: z.string().email(),
  numGuests: z.number().int().min(1),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rooms: z
    .array(
      z.object({
        type: BookingSchema,
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
});

export type CreateBookingInput = z.infer<typeof CreateBookinginputSchema>;
