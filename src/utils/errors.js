export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}
export const notFound = (m='Not found') => new ApiError(404, m);
export const badRequest = (m='Bad request', d) => new ApiError(400, m, d);
export const unauthorized = (m='Unauthorized') => new ApiError(401, m);
export const forbidden = (m='Forbidden') => new ApiError(403, m);
