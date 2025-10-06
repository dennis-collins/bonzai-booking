import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });

export const handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing booking data" }),
      };
    }

    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Invalid JSON in request body" }),
      };
    }

    const bookingId = payload.bookingId;
    if (!bookingId) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "bookingId is required" }),
      };
    }

    const getRes = await client.send(
      new GetItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: marshall({ bookingId }),
        ConsistentRead: true,
      })
    );

    if (!getRes.Item) {
      return {
        statusCode: 404,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Booking not found" }),
      };
    }

    const booking = unmarshall(getRes.Item);

    const nowIso = new Date().toISOString();
    const updateRes = await client.send(
      new UpdateItemCommand({
        TableName: process.env.TABLE_NAME,
        Key: marshall({ bookingId }),
        UpdateExpression: "SET #status = :confirmed, #updatedAt = :now",
        ExpressionAttributeNames: {
          "#status": "status",
          "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: marshall({
          ":confirmed": "confirmed",
          ":now": nowIso,
        }),
        ReturnValues: "ALL_NEW",
      })
    );

    const updated = unmarshall(updateRes.Attributes ?? getRes.Item);

    const totalRooms = Array.isArray(updated.rooms)
      ? updated.rooms.reduce((sum, r) => sum + (r.quantity ?? 0), 0)
      : 0;

    const confirmation = {
      bookingNumber: updated.bookingId,
      guestsAndRooms: {
        numGuests: updated.numGuests,
        totalRooms,
        rooms: updated.rooms,
      },
      totalAmount: updated.totalPrice,
      checkInDate: updated.checkInDate,
      checkOutDate: updated.checkOutDate,
      guestName: updated.guestName,
      status: updated.status ?? "confirmed",
    };

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Din bokning är bekräftad.",
        confirmation,
      }),
    };
  } catch (err) {
    console.error("Error confirming booking:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Failed to confirm booking",
        error: err.message,
      }),
    };
  }
};
