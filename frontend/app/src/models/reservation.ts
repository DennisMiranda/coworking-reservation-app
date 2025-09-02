export interface Reservation {
  id?: string;
  client: {
    name: string;
    email: string;
    phone: number;
  };
  title: string;
  start: string;
  end: string;
  userId: string;
  productId: string;
}
