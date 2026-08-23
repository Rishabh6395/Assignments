export class AppError extends Error {
  statusCode: number;
  code: string;
  details: Record<string, unknown>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: Record<string, unknown> = {}
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, code: string, details: Record<string, unknown> = {}) {
    super(404, code, `${resource} not found`, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', code = 'FORBIDDEN', details: Record<string, unknown> = {}) {
    super(403, code, message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', code = 'UNAUTHORIZED') {
    super(401, code, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code = 'CONFLICT', details: Record<string, unknown> = {}) {
    super(409, code, message, details);
  }
}

export class ValidationError extends AppError {
  constructor(details: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', 'Request validation failed', details);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code = 'BAD_REQUEST', details: Record<string, unknown> = {}) {
    super(400, code, message, details);
  }
}
