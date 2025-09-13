import {
  doc,
  collection,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import { db } from "/src/services/firebase/firebase.client";
import type {
  PublicReservation,
  Reservation,
  UserReservationResponse,
} from "../models/reservation";
import type { Product } from "../models/product";

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

//Get all reservations order by date on realtime
export const getAllReservations = async (
  onChanges: (reservation: UserReservationResponse, product: Product) => void
) => {
  try {
    const productsDocs = await getDocs(collection(db, "products"));

    const products: { [key: string]: Product } = {};
    productsDocs.forEach((doc) => {
      products[doc.id] = doc.data() as Product;
    });
    const q = query(collection(db, "reservations"), orderBy("start", "asc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      snap.docChanges().forEach(async (change) => {
        const { start, end, timezone, user_id, status, id } = change.doc.data();

        //Get user reservation
        const userDocRef = doc(db, "users", user_id);

        const userReservationRef = doc(userDocRef, "reservations", id);

        const reservationDetails = await getDoc(userReservationRef);

        if (!reservationDetails.exists()) {
          return;
        }

        const { product_id, client_email, client_name, client_phone, title } =
          reservationDetails.data() as UserReservationResponse;

        onChanges(
          {
            id,
            start,
            end,
            timezone,
            user_id,
            product_id,
            status,
            client_email,
            client_name,
            client_phone,
            title,
          },
          products[product_id]
        );
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
