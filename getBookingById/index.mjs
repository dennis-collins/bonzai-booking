import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddb } from "../lib/ddb.mjs";
import {
  ValidationError,
  NotFoundError,
  InternalError,
  errorResponse,
} from "../lib/error.mjs";

export const handler = async (event) => {
  try {
    const bookingId = event.pathParameters?.bookingId;

    if (!bookingId) {
      throw new ValidationError("Booking ID is required");
    }

    const data = await ddb.send(
      new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: { bookingId },
      })
    );

    if (!data.Item) {
      throw new NotFoundError(`Booking with ID ${bookingId} not found`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
  } catch (err) {
    console.error("Error fetching booking by ID:", err);
    return errorResponse(err instanceof Error ? err : new InternalError());
  }
};
