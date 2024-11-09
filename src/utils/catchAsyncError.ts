import { Request, Response, NextFunction } from "express";

type AsyncMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncMiddleware) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch((err: any) => {
      next(err);
    });
  };
};

export default asyncHandler;
