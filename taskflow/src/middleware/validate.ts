import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

type Source = 'body' | 'query' | 'params';

export function validate(schema: AnyZodObject, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[source]);
      (req as any)[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details: Record<string, string> = {};
        for (const issue of err.issues) {
          details[issue.path.join('.') || source] = issue.message;
        }
        return next(new ValidationError(details));
      }
      next(err);
    }
  };
}
