import { handler } from "./index.mjs";

const run = async () => {
  try {
    process.env.TABLE_NAME ||= "bonzai-booking-Bookings";
    process.env.AWS_REGION ||= "eu-north-1";

    const res = await handler();
    console.log("Lambda response:");
    console.log(res);

    const body = JSON.parse(res.body);
    const bookings = body.bookings || [];

    console.log(`\nTotal bookings: ${bookings.length}`);
    console.log("Bookings:", JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error("Lambda threw an error:", err);
  }
};

run();
