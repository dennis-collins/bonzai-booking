import { ddb } from "../lib/ddb.mjs";
import {
  ValidationError,
  NotFoundError,
  InternalError,
  errorResponse,
} from "../lib/error.mjs";
import { UpdateCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import {
  calculateNights,
  calculateTotalPrice,
  validateCapacity,
} from "../lib/pricing.mjs";

const ALLOWED_FIELDS = [
  "guestName",
  "guestEmail",
  "numGuests",
  "checkInDate",
  "checkOutDate",
  "rooms",
];

export const handler = async (event) => {
  try {
    const bookingId = event.pathParameters?.bookingId;
    if (!bookingId) throw new ValidationError("bookingId is required");

    if (!event.body) throw new ValidationError("Missing body");
    let patch;
    try {
      patch = JSON.parse(event.body);
    } catch {
      throw new ValidationError("Invalid JSON");
    }

    // Checking for valid fields for update.
    const updates = {};
    for (const key of ALLOWED_FIELDS) {
      if (patch[key] !== undefined) updates[key] = patch[key];
    }
    if (Object.keys(updates).length === 0) {
      throw new ValidationError("No valid fields to update");
    }

    // Read current item
    const curRes = await ddb.send(
      new GetCommand({ TableName: process.env.TABLE_NAME, Key: { bookingId } })
    );
    if (!curRes.Item) throw new NotFoundError("Booking not found");

    // Merging current data + updates to calc price.
    const merged = { ...curRes.Item, ...updates };

    validateCapacity({
      numGuests: merged.numGuests,
      rooms: merged.rooms,
    });
    const nights = calculateNights(merged.checkInDate, merged.checkOutDate);
    const totalPrice = calculateTotalPrice({ rooms: merged.rooms, nights });

    const exprNames = {};
    const exprValues = {};
    const sets = [];

    for (const k of Object.keys(updates)) {
      exprNames["#" + k] = k;
      exprValues[":" + k] = updates[k];
      sets.push(`#${k} = :${k}`);
    }

    exprNames["#totalPrice"] = "totalPrice";
    exprValues[":totalPrice"] = totalPrice;
    sets.push(`#totalPrice = :totalPrice`);

    const result = await ddb.send(
      new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: { bookingId },
        UpdateExpression: "SET " + sets.join(", "),
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: exprValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Booking updated",
        booking: result.Attributes,
      }),
    };
  } catch (err) {
    if (err?.name === "ConditionalCheckFailedException") {
      return errorResponse(new NotFoundError("Booking not found"));
    }
    if (err instanceof ValidationError || err instanceof NotFoundError) {
      return errorResponse(err);
    }
    console.error("Change booking error:", err);
    return errorResponse(new InternalError());
  }
};
