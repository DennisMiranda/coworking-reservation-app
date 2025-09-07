export interface EmailData {
  logo?: string;
  email: string;
  order_id: string;
  orders: Order[];
  cost: {
    total: string;
  };
}

interface Order {
  image_url: string;
  room_name: string;
  location: string;
  capacity: string;
  reserved_by: string;
  reservation_date: string;
  reservation_time: string;
  price_per_hour: string;
  details: string[];
  total_price: string;
}
