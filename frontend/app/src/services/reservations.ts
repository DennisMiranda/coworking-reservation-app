import {
  doc,
  collection,
  setDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "/src/services/firebase/firebase.client";
import type { PublicReservation, Reservation } from "../models/reservation";

// save reservation on firestore
export const saveReservation = async (reservation: Reservation) => {
  try {
    const { client, title, start, end, timezone, userId, productId, status } =
      reservation;
    const docUserRef = doc(collection(db, "users/" + userId + "/reservations"));
    const docReservationRef = doc(
      collection(db, "reservations"),
      docUserRef.id
    );

    await setDoc(docUserRef, {
      id: docUserRef.id,
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone,
      title,
      start,
      end,
      timezone,
      user_id: userId,
      product_id: productId,
      status: status,
    });

    await setDoc(docReservationRef, {
      id: docUserRef.id,
      start,
      end,
      timezone,
      user_id: userId,
      product_id: productId,
      status: status,
    });

    return {
      success: true,
      message: "Reservation saved successfully",
      data: { id: docUserRef.id },
    };
  } catch (error) {
    console.error("Error saving reservation: ", error);
    return { success: false, message: "Error saving reservation" };
  }
};

//Get reservations by product_id
export const getReservationsByProductId = async (productId: string) => {
  try {
    const querySnapshot = await getDocs(
      query(
        collection(db, "reservations"),
        where("product_id", "==", productId)
      )
    );
    const reservations: Reservation[] = [];
    querySnapshot.forEach((doc) => {
      const {
        client_name,
        client_email,
        client_phone,
        title,
        start,
        end,
        timezone,
        user_id,
        status,
      } = doc.data();
      reservations.push({
        id: doc.id,
        client: {
          name: client_name,
          email: client_email,
          phone: client_phone,
        },
        title,
        start,
        end,
        timezone,
        userId: user_id,
        productId,
        status,
      });
    });
    return {
      success: true,
      message: "Reservations retrieved successfully",
      data: reservations,
    };
  } catch (error) {
    console.error("Error retrieving reservations: ", error);
    return { success: false, message: "Error retrieving reservations" };
  }
};

//For calendar on realtime
//Get reservations by ProductId from today
export const getReservationsByProductIdFromToday = async (
  productId: string,
  onChanges: (reservation: PublicReservation) => void
) => {
  try {
    const q = query(
      collection(db, "reservations"),
      where("product_id", "==", productId),
      where("start", ">=", new Date().toISOString())
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        const { start, end, timezone, user_id, status, id } = change.doc.data();
        onChanges({
          id,
          start,
          end,
          timezone,
          userId: user_id,
          productId,
          status,
        });
      });
    });

    return {
      success: true,
      message: "Reservations retrieved successfully",
      data: {
        unsubscribe,
      },
    };
  } catch (error) {
    console.error("Error retrieving reservations: ", error);
    return { success: false, message: "Error retrieving reservations" };
  }
};

//Get all next reservations
export const getUpcomingReservations = async () => {
  try {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    date.setMinutes(date.getMinutes() < 30 ? 0 : 30);
    date.setSeconds(0);
    date.setMilliseconds(0);

    const reservations: PublicReservation[] = [];

    console.log(date.toISOString());

    const querySnapshot = await getDocs(
      query(
        collection(db, "reservations"),
        where("start", "==", date.toISOString())
      )
    );

    querySnapshot.forEach((doc) => {
      const { start, end, timezone, user_id, status, id, product_id } =
        doc.data();
      reservations.push({
        id,
        start,
        end,
        timezone,
        userId: user_id,
        productId: product_id,
        status,
      });
    });
    return {
      success: true,
      message: "Reservations retrieved successfully",
      data: reservations,
    };
  } catch (error) {
    console.error("Error retrieving reservations: ", error);
    return { success: false, message: "Error retrieving reservations" };
  }
};
