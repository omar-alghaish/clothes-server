import mongoose from "mongoose";
import 'stylesh'
require('dotenv').config;


const dbURL: string = process.env.DB_URI || '';

const connectDB = async () => {
    try {
        await mongoose.connect(dbURL).then((data: any) => {
            console.log(`Database connected with ${`${data.connection.name}`.color('lime')}`.createSolidBorder('lime'))
        })
    } catch (error: any) {
        console.log(error.message);
        setTimeout(connectDB, 5000);
    }
}

export default connectDB