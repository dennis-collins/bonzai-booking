import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { ScanCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "eu-north-1" });

export const handler = async () => {
  try {
    const data = await client.send(new ScanCommand({ TableName: "Bookings" }));

    return {
      statusCode: 200,
      body: JSON.stringify({ bookings: data.Items }),
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Failed to fetch bookings",
        error: error.message,
      }),
    };
  }
};
