import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { handler as confirmBooking } from "../confirmBooking/index.mjs";

const client = new DynamoDBClient({ region: "eu-north-1" });

function generateBookingID(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function handleBooking(data) {
  return {
    bookingId: { S: generateBookingID() },
    guestName: { S: data.guestName },
    guestEmail: { S: data.guestEmail },
    numGuests: { N: data.numGuests.toString() },
    checkInDate: { S: data.checkInDate },
    checkOutDate: { S: data.checkOutDate },
    totalPrice: { N: data.totalPrice.toString() },
    rooms: {
      L: data.rooms.map((r) => ({
        M: {
          type: { S: r.type },
          quantity: { N: r.quantity.toString() },
        },
      })),
    },
  };
}

export const handler = async (event) => {
  try {
    console.log("Received event body:", event.body);

    const data = JSON.parse(event.body);

    if (
      !data.guestName ||
      !data.guestEmail ||
      !data.numGuests ||
      !data.checkInDate ||
      !data.checkOutDate ||
      !data.totalPrice ||
      !data.rooms ||
      !Array.isArray(data.rooms) ||
      data.rooms.length === 0
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing or invalid booking data" }),
      };
    }

    const params = {
      TableName: process.env.TABLE_NAME,
      Item: handleBooking(data),
    };

    await client.send(new PutItemCommand(params));

    const confirmation = await confirmBooking({ body: JSON.stringify(data) });

    return {
      statusCode: 200,
      body: confirmation.body,
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to create booking",
        error: error.message,
      }),
    };
  }
};
