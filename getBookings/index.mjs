import { ddb } from "../lib/ddb.mjs";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { errorResponse, InternalError } from "../lib/error.mjs";

export const handler = async () => {
  try {
    const data = await ddb.send(
      new ScanCommand({ TableName: process.env.TABLE_NAME })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ bookings: data.Items }),
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return errorResponse(new InternalError(error.message));
  }
};
