import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { ValidationError } from "../errors";

export const validate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((err: any) => err.msg)
      .join(", ");
    throw new ValidationError(messages);
  }
  next();
};
