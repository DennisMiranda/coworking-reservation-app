import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "/src/services/firebase/firebase.client";
import type { Reservation } from "/src/models/reservation";

// Interfaz para estadísticas del dashboard
export interface DashboardStats {
  todayReservations: number;
  activeRooms: number;
  totalUsers: number;
  revenueToday: number;
}

// Interfaz para reservas administrativas
export interface AdminReservation extends Reservation {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
  status: "active" | "pending" | "cancelled" | "completed";
}

// Obtener todas las reservas para administración
export const getAllReservations = async (): Promise<{
  success: boolean;
  data?: AdminReservation[];
  message: string;
}> => {
  try {
    // Obtener de la colección principal de reservas
    const reservationsQuery = query(
      collection(db, "reservations"),
      orderBy("start", "desc"),
      limit(50)
    );

    const snapshot = await getDocs(reservationsQuery);
    const reservations: AdminReservation[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        client: {
          name: data.client_name || data.clientName,
          email: data.client_email || data.clientEmail,
          phone: data.client_phone || data.clientPhone,
        },
        title: data.title,
        start: data.start,
        end: data.end,
        userId: data.user_id || data.userId,
        productId: data.product_id || data.productId,
        status: data.status || "active",
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
      });
    });

    return {
      success: true,
      data: reservations,
      message: "Reservations retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting all reservations:", error);
    return {
      success: false,
      message: "Error retrieving reservations",
    };
  }
};

// Obtener reservas recientes para el dashboard
export const getRecentReservations = async (
  limitCount: number = 10
): Promise<{
  success: boolean;
  data?: AdminReservation[];
  message: string;
}> => {
  try {
    const reservationsQuery = query(
      collection(db, "reservations"),
      orderBy("start", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(reservationsQuery);
    const reservations: AdminReservation[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      reservations.push({
        id: doc.id,
        client: {
          name: data.client_name || data.clientName,
          email: data.client_email || data.clientEmail,
          phone: data.client_phone || data.clientPhone,
        },
        title: data.title,
        start: data.start,
        end: data.end,
        userId: data.user_id || data.userId,
        productId: data.product_id || data.productId,
        status: data.status || "active",
        createdAt: data.createdAt?.toDate?.() || new Date(),
      });
    });

    return {
      success: true,
      data: reservations,
      message: "Recent reservations retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting recent reservations:", error);
    return {
      success: false,
      message: "Error retrieving recent reservations",
    };
  }
};

// Actualizar una reserva
export const updateReservation = async (
  reservationId: string,
  updateData: Partial<AdminReservation>
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const reservationRef = doc(db, "reservations", reservationId);

    const dataToUpdate: any = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };

    // Si se actualizan datos del cliente, convertir al formato de la DB
    if (updateData.client) {
      dataToUpdate.client_name = updateData.client.name;
      dataToUpdate.client_email = updateData.client.email;
      dataToUpdate.client_phone = updateData.client.phone;
      delete dataToUpdate.client;
    }

    await updateDoc(reservationRef, dataToUpdate);

    return {
      success: true,
      message: "Reservation updated successfully",
    };
  } catch (error) {
    console.error("Error updating reservation:", error);
    return {
      success: false,
      message: "Error updating reservation",
    };
  }
};

// Cancelar una reserva
export const cancelReservation = async (
  reservationId: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const reservationRef = doc(db, "reservations", reservationId);

    await updateDoc(reservationRef, {
      status: "cancelled",
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      message: "Reservation cancelled successfully",
    };
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    return {
      success: false,
      message: "Error cancelling reservation",
    };
  }
};

// Eliminar una reserva
export const deleteReservation = async (
  reservationId: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const reservationRef = doc(db, "reservations", reservationId);
    await deleteDoc(reservationRef);

    return {
      success: true,
      message: "Reservation deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return {
      success: false,
      message: "Error deleting reservation",
    };
  }
};

// Bloquear fechas específicas
export const blockDate = async (
  productId: string,
  startDate: string,
  endDate: string,
  reason: string = "Blocked by admin"
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const blockRef = doc(collection(db, "blocked_dates"));

    await setDoc(blockRef, {
      productId,
      startDate,
      endDate,
      reason,
      createdAt: Timestamp.now(),
      createdBy: "admin", // TODO: usar el ID del admin actual
    });

    return {
      success: true,
      message: "Date blocked successfully",
    };
  } catch (error) {
    console.error("Error blocking date:", error);
    return {
      success: false,
      message: "Error blocking date",
    };
  }
};

// Obtener estadísticas del dashboard
export const getDashboardStats = async (): Promise<{
  success: boolean;
  data?: DashboardStats;
  message: string;
}> => {
  try {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const todayEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Obtener reservas de hoy
    const todayReservationsQuery = query(
      collection(db, "reservations"),
      where("start", ">=", todayStart.toISOString()),
      where("start", "<", todayEnd.toISOString())
    );

    const todaySnapshot = await getDocs(todayReservationsQuery);
    const todayReservations = todaySnapshot.size;

    // Mock data para las otras estadísticas (en producción obtener de Firestore)
    const stats: DashboardStats = {
      todayReservations,
      activeRooms: 8, // TODO: obtener de colección de productos
      totalUsers: 124, // TODO: obtener de colección de usuarios
      revenueToday: 2340, // TODO: calcular basado en reservas de hoy
    };

    return {
      success: true,
      data: stats,
      message: "Dashboard stats retrieved successfully",
    };
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      success: false,
      message: "Error retrieving dashboard stats",
    };
  }
};
