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

export interface EmailSettingsResponse {
  reminder_subject: string;
  reminder_content: string;
}

export interface EmailReminderData {
  order_id: string;
  room_name: string;
  location: string;
  reserved_by: string;
  reservation_date: string;
  reservation_time: string;
  image_url: string;
  email: string;
}
