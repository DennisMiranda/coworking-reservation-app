//Api to connect github actios
import type { APIRoute } from "astro";
import { getUpcomingReservations } from "/src/services/reservations";
import {
  sendReservationReminderEmail,
  getEmailSettings,
  getReminderBody,
} from "/src/services/email/email.server";
import { db, auth } from "/src/services/firebase/firebase.server";
import type { UserReservationResponse } from "/src/models/reservation";
import type { Product } from "/src/models/product";
import type { EmailReminderData } from "/src/models/email";
import { getReservationDate } from "/src/utils/date";

export const GET: APIRoute = async ({ request }) => {
  try {
    // get the security token
    const doc = await db.collection("settings").doc("security").get();
    if (!doc.exists) {
      return new Response("Error getting security token", { status: 500 });
    }

    // check if the request has a valid token
    const { reminder_secret } = doc.data() as { reminder_secret: string };
    const token = request.headers.get("Authorization");
    if (token !== `Bearer ${reminder_secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { success, data: reservations } = await getUpcomingReservations();

    if (success && reservations?.length) {
      const settings = await getEmailSettings();

      const productsDocs = await db.collection("products").get();

      if (!settings || productsDocs.empty) {
        return new Response("Error getting email settings or products", {
          status: 500,
        });
      }

      const { subject, content } = settings;

      const products: { [key: string]: Product } = {};
      productsDocs.forEach((doc) => {
        products[doc.id] = doc.data() as Product;
      });

      for (const reservation of reservations) {
        if (!reservation?.id) {
          continue;
        }

        const doc = await db
          .collection("users")
          .doc(reservation.userId)
          .collection("reservations")
          .doc(reservation.id)
          .get();

        if (!doc.exists) {
          continue;
        }

        const { client_email, client_name, start, end } =
          doc.data() as UserReservationResponse;
        const { day, timeStart, timeEnd } = getReservationDate(start, end);

        const emailReminderData: EmailReminderData = {
          order_id: reservation.id,
          room_name: products[reservation.productId].title,
          location: products[reservation.productId].address,
          reserved_by: client_name,
          reservation_date: day,
          reservation_time: `${timeStart} - ${timeEnd}`,
          image_url: products[reservation.productId].image,
          email: client_email,
        };
        const body = getReminderBody(content, emailReminderData);

        await sendReservationReminderEmail(client_email, subject, body);
      }
    }
    return new Response("Reminder API called", { status: 200 });
  } catch (error) {
    console.error(error);

    return new Response("Error", { status: 500 });
  }
};
