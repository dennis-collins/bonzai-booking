import { ddb } from "../lib/ddb.mjs";
import {
  ValidationError,
  NotFoundError,
  InternalError,
  errorResponse,
} from "../lib/error.mjs";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ALLOWED_FIELDS = [
  "guestName",
  "guestEmail",
  "numGuests",
  "checkInDate",
  "checkOutDate",
  "totalPrice",
  "rooms",
];

function buildUpdate(data) {
  const names = {};
  const values = {};
  const setParts = [];

  for (const key of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      const nameAlias = `#${key}`;
      const valueAlias = `:${key}`;
      names[nameAlias] = key;
      values[valueAlias] = data[key];
      setParts.push(`${nameAlias} = ${valueAlias}`);
    }
  }

  // updatedAt från servern
  const now = new Date().toISOString();
  names["#updatedAt"] = "updatedAt";
  values[":updatedAt"] = now;
  setParts.push("#updatedAt = :updatedAt");

  if (setParts.length === 0) {
    throw new ValidationError("No updatable fields provided");
  }

  return {
    UpdateExpression: `SET ${setParts.join(", ")}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  };
}

export const handler = async (event) => {
  try {
    const pathId = event?.pathParameters?.bookingId;

    if (!event?.body) {
      throw new ValidationError("Missing request body");
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch {
      throw new ValidationError("Invalid JSON in request body");
    }

    const bookingId = pathId || body.bookingId;
    if (!bookingId) {
      throw new ValidationError("bookingId is required");
    }

    // Plocka ut de fält som faktiskt ska uppdateras
    const toUpdate = {};
    for (const f of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, f)) {
        toUpdate[f] = body[f];
      }
    }

    const {
      UpdateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    } = buildUpdate(toUpdate);

    // Kolla att booking finns, och att nuvarande email matchar
    let ConditionExpression = "attribute_exists(#pk)";
    const condNames = { "#pk": "bookingId" };
    const condValues = {};

    const guardEmail =
      event?.queryStringParameters?.guestEmail ?? body?.guardGuestEmail;

    if (guardEmail !== undefined && guardEmail !== null && guardEmail !== "") {
      ConditionExpression += " AND #guardEmail = :guardEmail";
      condNames["#guardEmail"] = "guestEmail";
      condValues[":guardEmail"] = guardEmail;
    }

    const params = {
      TableName: process.env.TABLE_NAME,
      Key: { bookingId },
      ReturnValues: "ALL_NEW",
      UpdateExpression,
      ExpressionAttributeNames: { ...ExpressionAttributeNames, ...condNames },
      ExpressionAttributeValues: {
        ...ExpressionAttributeValues,
        ...condValues,
      },
      ConditionExpression,
    };

    const result = await ddb.send(new UpdateCommand(params));

    if (!result?.Attributes) {
      throw new NotFoundError(`Booking with ID ${bookingId} not found`);
    }

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
      return errorResponse(
        new NotFoundError("Booking not found or email mismatch")
      );
    }
    return errorResponse(err instanceof Error ? err : new InternalError());
  }
};
