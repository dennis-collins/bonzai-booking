// bas klass för alla app fel, hur felen ska hanteras för och visas i http-respons
export class AppError extends Error {
  constructor(message, statusCode = 400, details = undefined) {
    super(message); // anropa bas klass konstruktor
    this.statusCode = statusCode; // http status kod
    this.details = details; // extra info om fel (valfritt)
  }
}

// felklass för valideringsfel
export class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}

// felklass för icke funnet fel
export class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

// felklass för interna server fel
export class InternalError extends AppError {
  constructor(message = "Internal Server Error") {
    super(message, 500);
    this.name = "InternalError";
  }
}

// Hjälpfunktion: konvertera error objectet till HTTP-respons
export function errorResponse(err) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: err.name,
        message: err.message,
        details: err.details,
      }),
    };
  }

  // om okänt fel ger -> 500
  return {
    statusCode: 500,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      error: "InternalError",
      message: err?.message || "Unexpected error",
    }),
  };
}
