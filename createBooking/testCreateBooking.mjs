// testCreateBooking.mjs
import { handler } from "./index.mjs"; // ändra path om filen ligger annorlunda

// Mock-event som liknar API Gateway

function generateBookingID(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const event = {
  body: JSON.stringify({
    bookingId: generateBookingID(),
    guestName: "Alice Example",
    guestEmail: "alice@example.com",
    numGuests: 2,
    checkInDate: "2025-09-20",
    checkOutDate: "2025-09-22",
    totalPrice: 300,
    rooms: [
      { type: "single", quantity: 1 },
      { type: "double", quantity: 1 },
    ],
  }),
};

const run = async () => {
  process.env.TABLE_NAME ||= "bonzai-booking-Bookings"; // byt till din DynamoDB-tabell
  process.env.AWS_REGION ||= "eu-north-1";

  const res = await handler(event);
  console.log("Lambda response:");
  console.log(res);
};

run();
