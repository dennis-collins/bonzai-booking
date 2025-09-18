import { ddb } from "../lib/ddb.mjs";
import {
  ValidationError,
  NotFoundError,
  InternalError,
  errorResponse,
} from "../lib/error.mjs";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

export const handler = async (event) => {
  try {
    const pathID = event.pathParameters.bookingId;
    let body = {};

    if (event.body) {
      try {
        body = JSON.parse(event.body);
      } catch {
        throw new ValidationError("Invalid JSON in res");
      }
    }

    const bookingId = pathID || body.bookingId;
    const guestEmail = body.guestEmail;

    if (!bookingId) {
      throw new ValidationError("bookingID is required");
    }

    // Params för DeleteCommand

    const params = {
      TableName: process.env.TABLE_NAME,
      Key: { bookingId },
      ReturnValues: "ALL_OLD",
    };

    if (guestEmail !== undefined && guestEmail !== null && guestEmail !== "") {
      params.ConditionExpression = "guestEmail = :g";
      params.ExpressionAttributeValues = { ":g": guestEmail };
    }

    // Kör delete

    const result = await ddb.send(new DeleteCommand(params));

    if (!result.Attributes) {
      throw new NotFoundError(`Booking with ID ${bookingId} not found`);
    }

    return {
      statusCode: 204,
      headers: { "Content-Type": "application/json" },
      body: null,
    };
  } catch (err) {
    // DynamoDB condition fail (fel guestEmail) maskeras som 404
    if (err.name === "ConditionalCheckFailedException") {
      return errorResponse(
        new NotFoundError("Booking not found or email mismatch")
      );
    }
    return errorResponse(err instanceof Error ? err : new InternalError());
  }
};
