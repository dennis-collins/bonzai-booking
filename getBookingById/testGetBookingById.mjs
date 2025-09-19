import { handler } from "./index.mjs";

const event = {
  pathParameters: {
    id: "TJMNG6", // <-- byt till ett bookingId som du vet finns i din DynamoDB-tabell
  },
};

const run = async () => {
  try {
    process.env.TABLE_NAME ||= "bonzai-booking-Bookings";
    process.env.AWS_REGION ||= "eu-north-1";

    const res = await handler(event);
    console.log("Lambda response:");
    console.log(res);

    if (res.statusCode === 200) {
      const booking = JSON.parse(res.body);
      console.log("\nBooking found:");
      console.log(JSON.stringify(booking, null, 2));
    }
  } catch (err) {
    console.error("Lambda threw an error:", err);
  }
};

run();
