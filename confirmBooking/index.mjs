export const handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Missing booking data" }),
      };
    }

    let booking;
    try {
      booking = JSON.parse(event.body);
    } catch {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Invalid JSON in request body" }),
      };
    }

    console.log("Din bokning är klar, se alla detaljer nedan:");
    console.log(JSON.stringify(booking, null, 2));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "Din bokning är klar, se alla detaljer nedan.",
        booking,
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
