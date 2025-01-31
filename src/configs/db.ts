import mongoose from "mongoose";
import "stylesh";
import dotenv from "dotenv";
// dotenv.config({ path: "../config.env" });

process.env.DB_URL = "mongodb://127.0.0.1:27017/clotheStore";
const dbURL: string = process.env.DB_URL || "";
console.log("url: ", dbURL);

const connectDB = async () => {
  try {
    await mongoose.connect(dbURL).then((data: any) => {
      console.log(`Database connected with ${data.connection.name}`);
    });
  } catch (error: any) {
    console.log(error.message);
  }
};

export default connectDB;
