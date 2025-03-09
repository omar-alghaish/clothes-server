require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error";
import itemRouter from "./routes/itemRoutes";
import userRouter from './routes/userRoutes'
import cartRouter from './routes/cartRoutes'
import ordertRouter from './routes/orderRoutes'

export const app = express();

// body parser
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

//cross origin resourse sharing
app.use(
  cors()
);

// routes
app.use("/api/v1/items", itemRouter);
app.use('/api/v1/users', userRouter)
app.use('/api/v1/cart', cartRouter)
app.use('/api/v1/orders', ordertRouter)

// testing api
app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "api is working",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(errorMiddleware);
