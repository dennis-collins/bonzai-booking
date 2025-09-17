import {z} from 'zod';


export const BookingSchema = z.enum(["Single", "Double", "Suite"]);

export const CreateBookinginputSchema = z.object({
    guestName: z.string().min(1),
    guests: z.number().int().min(1),
    rooms: z.array(z.object({
        type: BookingSchema,
        quantity: z.number().int().min(1)
    })).min(1),
    totalPrice: z.number().min(0)
});

export type CreateBookingInput = z.infer<typeof CreateBookinginputSchema>;

