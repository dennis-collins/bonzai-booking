import { handler } from "./index.mjs";

const event = {
  body: JSON.stringify({
    bookingId: "ABC123",
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
  const res = await handler(event);
  console.log("Lambda response:");
  console.log(res);
};

run();
