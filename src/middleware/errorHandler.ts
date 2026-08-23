import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND',
    details: { path: req.originalUrl, method: req.method }
  });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    details: {}
  });
}
