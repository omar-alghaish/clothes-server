require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorMiddleware } from "./middlewares/error";
import itemRouter from "./routes/itemRoutes";
import userRouter from './routes/userRoutes'
import cartRouter from './routes/cartRoutes'
import ordertRouter from './routes/orderRoutes'
import reviewRouter from './routes/reviewRoutes'
import addressRouter from './routes/addressRoutes'
import paymentRouter from './routes/paymentCardRoutes'
import favouritRouter from './routes/favouritRoutes'
import complaintRouter from "./routes/complaintRoutes";
import brandRouter from "./routes/brandRoutes";
import categoryRouter from "./routes/categoryRoutes";


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
app.use('/api/v1/brands', brandRouter)
app.use('/api/v1/reviews', reviewRouter)
app.use('/api/v1/addresses', addressRouter)
app.use('/api/v1/payment-cards', paymentRouter)
app.use('/api/v1/favorites', favouritRouter)
app.use("/api/v1/complaints", complaintRouter);
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/brands', brandRouter)

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
