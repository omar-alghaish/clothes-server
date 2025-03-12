import mongoose, { Document, Schema } from "mongoose";

export interface IAddress extends Document {
  firstName: string; // Recipient's first name
  lastName: string; // Recipient's last name
  phoneNumber: string; // Recipient's phone number
  email: string;    // Recipient's email 
  country: string;
  city: string;
  state: string;
  streetAddress: string;
  zipCode: string;
  user: mongoose.Schema.Types.ObjectId; // Reference to the user who created this address
}

const addressSchema: Schema<IAddress> = new Schema<IAddress>(
  {
    firstName: { type: String, required: true }, // Recipient's first name
    lastName: { type: String, required: true }, // Recipient's last name
    phoneNumber: { type: String, required: true }, // Recipient's phone number

    //Recipient's email
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/\S+@\S+\.\S+/, "Please use a valid email address"],
    },
    country: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    streetAddress: { type: String, required: true },
    zipCode: { type: String, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
},
{
    timestamps: true,
}
);


export const Address = mongoose.model<IAddress>("Address", addressSchema);