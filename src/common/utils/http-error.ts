// Simple error handler - can be enhanced with toast library later
export interface ErrorData {
  message?: string;
}

const FALLBACK_STATUS_MESSAGES: Record<number, string> = {
  400: "Invalid request. Please try again.",
  401: "Unauthorized. Please check your credentials.",
  403: "You don't have permission to perform this action.",
  404: "Resource not found.",
  429: "Too many attempts. Please wait a moment and try again.",
  500: "Server error. Please try again later.",
};

export const handleError = (err: unknown) => {
  if (err && typeof err === 'object' && 'status' in err) {
    const error = err as { status: number; data?: ErrorData };
    const statusCode = typeof error.status === "number" ? error.status : undefined;
    const message =
      error.data?.message ||
      (statusCode ? FALLBACK_STATUS_MESSAGES[statusCode] : undefined) ||
      "Something went wrong";
    console.error('API Error:', message);
    alert(message); // Using alert for now, can be replaced with toast
    return message;
  } else if (err && typeof err === 'object' && 'message' in err) {
    const message = (err as { message: string }).message || "Something went wrong";
    console.error('Error:', message);
    alert(message);
    return message;
  } else {
    const message = "Something went wrong";
    console.error('Unknown error:', err);
    alert(message);
    return message;
  }
};
