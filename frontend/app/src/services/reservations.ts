import {
  doc,
  collection,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "/src/services/firebase/firebase.client";
import type { Reservation } from "../models/reservation";

// save reservation on firestore
export const saveReservation = async (reservation: Reservation) => {
  try {
    const { client, title, start, end, userId, productId } = reservation;
    const docRef = doc(collection(db, "users/" + userId + "/reservations"));
    await setDoc(docRef, {
      client_name: client.name,
      client_email: client.email,
      client_phone: client.phone,
      title,
      start,
      end,
      user_id: userId,
      product_id: productId,
    });
    return {
      success: true,
      message: "Reservation saved successfully",
      data: { id: docRef.id },
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
        user_id,
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
        userId: user_id,
        productId,
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
