import mongoose from "mongoose";
import "stylesh";

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
