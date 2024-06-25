import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"; //agar default export hota to aaise import nahi karte hai
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const  generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessTokens()
        const refereshToken = user.generateRefereshTokens()
        user.refereshToken =refereshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refereshToken}

    } catch (error) {
        throw new ApiError(500 ," Something went wrong while generating referesh and access token ")
    }
}

const registerUser = asyncHandler(async (req, res) => {
  //GET USER Details from frontend
  //validation - not empty
  //check if user already exixts: username, email
  //check for images, check for avatar
  //upload them to cloudinary,avatar
  // create user object -> monogdb me bhejenge nosql database me -> to object jata hai
  // remove password and refresh token field from response
  //check for user creaction
  //return result

  const { fullname, email, username, password } = req.body;
  //console.log("email", email)

  // if(fullname===""){
  //     throw new ApiError(400 , "Full name is required")
  // }

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //User hi mongodb ko call karega kyu ki usi ke pass right hai
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or usernamee already exists");
  }

  const avatarLoacalPath = req.files?.avatar[0]?.path;
  //const coverimageLoacalPath = req.files?.coverImage[0]?.path;
  let coverimageLoacalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverimageLoacalPath = req.files.coverImage[0].path;
  }

  if (!avatarLoacalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLoacalPath);
  const coverImage = await uploadOnCloudinary(coverimageLoacalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //Now entry in database of all the above data
  //User is only interacting with database

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //Username is required or email
  //Password is required
  //Database authentication is required
  //if correct then enter successfully
  //If 3 attempt worong then not allowed
  //Do forget password and then through email generate it

  //req body ->data
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send cookie,

  const { email, username, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid Password");
  }

  const {accessToken, refereshToken}= await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refereshToken")

  const options ={
    httpOnly: true,
    secure:true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken , options)
  .cookie("refreshToken", refereshToken , options)
  .json(
    new ApiResponse(
        200, 
        {
            user: loggedInUser, accessToken , refereshToken
        },
        "User logged In Successfully"
    )
  )

  const logoutUser = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refereshToken:undefiend
            }
        },
        {
            new:true
        }
    )
    const options ={
        httpOnly: true,
        secure:true
      }
      return res.status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json(new ApiResponse(200 , {}, "User logged Out"))
  })

});

export { registerUser, loginUser , logoutUser};
