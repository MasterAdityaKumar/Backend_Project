import { Timestamp } from "mongodb";
import mongoose ,{Schema} from "mongoose";

import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema =new Schema({

    videoFile:{
        type:String,
        required:true //cloudinary url
    },
    thumbnail:{
        type:String,
        required:true //cloudinary url
    },
    title:{
        type:String,
        required:true 
    },
    description:{
        type:String,
        required:true 
    },
    duration:{
        type:Number,
        required:true //cloudinary url
    },
    views:{
        type:String,
        default:0 
    },
    isPublished:{
        type:String,
        default:true //cloudinary url
    },
    owner:{
        type:Schma.Types.ObjectId,
        ref:"User"
    },

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video =monogoose.model("Video", videoSchema)