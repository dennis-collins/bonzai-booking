import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import {
  calculateNights,
  calculateTotalPrice,
  validateCapacity,
} from "../lib/pricing.mjs";
import { ValidationError } from "../lib/error.mjs";

const client = new DynamoDBClient({ region: "eu-north-1" });

// Creates a booking nr that's more user-friendly.
function generateBookingID(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function handleBooking(data, totalPrice, bookingId) {
  return {
    bookingId: { S: bookingId },
    guestName: { S: data.guestName },
    guestEmail: { S: data.guestEmail },
    numGuests: { N: data.numGuests.toString() },
    checkInDate: { S: data.checkInDate },
    checkOutDate: { S: data.checkOutDate },
    totalPrice: { N: totalPrice.toString() },
    rooms: {
      L: data.rooms.map((r) => ({
        M: {
          type: { S: r.type },
          quantity: { N: r.quantity.toString() },
        },
      })),
    },
    status: { S: "confirmed" },
    createdAt: { S: new Date().toISOString() },
  };
}

export const handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    validateCapacity({ numGuests: data.numGuests, rooms: data.rooms });
    const nights = calculateNights(data.checkInDate, data.checkOutDate);
    const totalPrice = calculateTotalPrice({ rooms: data.rooms, nights });
    const bookingId = generateBookingID();
    const params = {
      TableName: process.env.TABLE_NAME,
      Item: handleBooking(data, totalPrice, bookingId),
      ConditionExpression: "attribute_not_exists(bookingId)",
    };

    await client.send(new PutItemCommand(params));

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Booking created successfully",
        booking: {
          bookingId,
          ...data,
          totalPrice,
          status: "confirmed",
        },
      }),
    };
  } catch (error) {
    const status = error instanceof ValidationError ? 400 : 500;
    return {
      statusCode: status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: status === 400 ? error.message : "Failed to create booking",
      }),
    };
  }
};
