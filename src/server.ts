import dotenv from "dotenv";
dotenv.config();
import { app } from "./app";
import "stylesh";
import connectDB from "./configs/db";
import { v2 as cloudinary } from "cloudinary"


// cloudinary config
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_SECRET_KEY
// })

// create server

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on port: ${`${port}`.color('lime')}`.createSolidBorder("lime"));
   connectDB()
});