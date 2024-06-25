import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js" //agar default export hota to aaise import nahi karte hai
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req,res)=>{
    
    //GET USER Details from frontend
    //validation - not empty
    //check if user already exixts: username, email
    //check for images, check for avatar
    //upload them to cloudinary,avatar
    // create user object -> monogdb me bhejenge nosql database me -> to object jata hai
    // remove password and refresh token field from response
    //check for user creaction
    //return result

    const {fullname, email, username, password} = req.body
    console.log("email", email)

    // if(fullname===""){
    //     throw new ApiError(400 , "Full name is required")
    // }

    if(
        [fullname ,email , username , password].some((field)=>field?.trim()==="")
    ){
            throw new ApiError(400,"All fields are required")
    }

    //User hi mongodb ko call karega kyu ki usi ke pass right hai 
    const existedUser = User.findOne({
        $or:[{username} ,{email}]
    })

    if(existedUser) {
        throw new ApiError(409,"User with email or usernamee already exists")

    }

   const avatarLoacalPath = req.files?.avatar[0]?.path;
   const coverimageLoacalPath = req.files?.coverImage[0]?.path;

   if(!avatarLoacalPath){
    throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLoacalPath)
   const coverImage =await uploadOnCloudinary(coverimageLoacalPath)

   if(!avatar){
    throw new ApiError(400 ,"Avatar file is required")
   }

   //Now entry in database of all the above data 
   //User is only interacting with database

   const user = await User.create({
    fullname,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()

   })
   const createdUser =await User.findById(user._id).select(
    "-password -refreshToken"
   )

   if(!createdUser){
    throw new ApiError(500, "Something went wrong while registering user")

   }

   return res.status(201).json(
    new ApiResponse(200, createdUser , "User registered successfully")
   )


})


export {registerUser,}