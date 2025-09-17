export type Roomtype =  "Single" | "Double" | "Suite" ;

export interface RoomSelection {
 type: Roomtype;
 quantity: number;
}

export interface Booking {
    bookingId: string;
    guestName: string;
    guests: number;
    rooms: RoomSelection[];
    totalPrice: number;
    status:"confirmed"| "cancelled";
    createdAt: string;
}