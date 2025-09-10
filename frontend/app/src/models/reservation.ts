import * as z from "zod";

export const reservationSchema = z.object({
  id: z.string().optional(),
  client: z.object({
    name: z.string().min(3, { message: "Title must be at least 3 characters" }),
    email: z.email(),
    phone: z
      .string()
      .regex(/^[0-9]{9}$/, { message: "Phone number must be 9 digits" }),
  }),
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  start: z.string().nonempty({ message: "Start date is required" }),
  end: z.string().nonempty({ message: "End date is required" }),
  userId: z.string(),
  productId: z.string(),
  status: z.enum(["active", "inactive"]),
});

export type Reservation = z.infer<typeof reservationSchema>;

export const PublicReservationSchema = reservationSchema.pick({
  id: true,
  start: true,
  end: true,
  userId: true,
  productId: true,
  status: true,
});

export type PublicReservation = z.infer<typeof PublicReservationSchema>;
