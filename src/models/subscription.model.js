import mongoose , {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, //one who is subscribing
        ref:"User"
    },
    channel:{
        type: Schema.Types.ObjectId, //one to whom subscriber is subscribinhg 
        ref:"User"
    }
},{timestamps:true})

export const subscription = mongoose.model("Subscription", subscriptionSchema)