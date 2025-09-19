// testChangeBooking.mjs
import { handler } from "./index.mjs";

const event = {
  pathParameters: { bookingId: "ALZ3R5" }, // byt till ett som finns
  body: JSON.stringify({
    // fält att uppdatera (skicka de du vill)
    totalPrice: 350,
    // Guard – kräver att nuvarande guestEmail i DB är denna (om du vill)
    guardGuestEmail: "alice@example.com",
  }),
};

const run = async () => {
  process.env.TABLE_NAME ||= "bonzai-booking-Bookings";
  process.env.AWS_REGION ||= "eu-north-1";

  const res = await handler(event);
  console.log("Lambda response:");
  console.log(res);
};

run();
