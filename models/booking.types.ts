export type Roomtype = "Enkelrum" | "Dubbelrum" | "Svit";
export interface RoomSelection {
  type: Roomtype;
  quantity: number;
}

export interface Booking {
  bookingId: string;
  guestName: string;
  guestEmail: string;
  numGuests: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  rooms: RoomSelection[];
  totalPrice: number;
  status: "confirmed" | "cancelled";
  createdAt: string;
}
