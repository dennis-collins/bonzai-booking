// testRemoveBooking.mjs
import { handler } from "./index.mjs";

// Mock-event som liknar det API Gateway skickar
const event = {
  pathParameters: {
    bookingId: "ALZ3R5", // <-- ändra till ett ID som finns i din DynamoDB-tabell
  },
  body: JSON.stringify({
    guestEmail: "alice@example.com", // valfritt, kan tas bort om du inte använder condition
  }),
};

const run = async () => {
  try {
    const res = await handler(event);
    console.log("Lambda response:");
    console.log(res);
  } catch (err) {
    console.error("Lambda threw an error:", err);
  }
};

run();
