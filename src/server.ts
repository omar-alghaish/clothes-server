import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";
import "stylesh";
import connectDB from "./configs/db";

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port: ${`${port}`.color('lime')}`.createSolidBorder("lime"));
   connectDB()
});