import mongoose from "mongoose";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import  Jwt  from "jsonwebtoken";




const registerUser = asyncHandler(async (req, res) => {
    const { userName, email, password, fullName } = req.body;

    // Checking if any of the required fields are empty or only whitespace
    if ([ userName, email, password, fullName].some((fields)=>  fields?.trim() === "" )) {
        // If any field is empty or contains only whitespace
        return res.status(400).json({ message: "All fields are required" });
    }

    const existedUser = await User.findOne({$or: [{email}, {userName}]})
    if (existedUser) {
        // If a user with the provided email or username already exists
        console.error("User with the provided email or username already exists");
        return res.status(400).json({
        message: "User with the provided email or username already exists",
        });
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImgLocalPath = req.files?.coverImg[0]?.path;

    // Check if avatar local path is missing
    if (!avatarLocalPath) {
        throw new Error("Avatar local path is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImg = await uploadOnCloudinary(coverImgLocalPath)


    // Check if avatar upload failed
    if (!avatar) {
        return res.status(400).json({ error: "Avatar file upload failed" });
    }
    
    const user = await User.create({
        fullName,
        email,
        password,
        userName: userName.toLowerCase(),
        avatar: avatar.url,
        coverImg: coverImg?.url || ""
    })

    const createdUser = await User.findById(user._id).select(    "-password -refreshToken"    )

    if (!createdUser) {
        return res.status(500).json({ error: "User creation failed" }); // Corrected error message
    }

    console.log(createdUser);

    
  // Respond with the created user object
  return res.status(201).json({ user: createdUser }); // Renamed key to 'user' for clarity

});




const generateAccessTokenAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateReferenceToken();

    user.refreshToken = refreshToken
    await user.save({validateBeforeSave: false})
    return ({accessToken, refreshToken})
}




const loginUser = asyncHandler (async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ email: "email is required" });
    }

    const user = await User.findOne({email})
    if (!user) {
        return res.status(400).json({ user: "email does not exist" });
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    console.log(user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ password: "wrong password" });
    }

    const { accessToken, refreshToken} = await generateAccessTokenAndRefreshToken(user._id)

    const loginUsers = await User.findById(user._id).select( " -password -refreshToken " )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json({ accessToken, refreshToken, message: "User login successfully" });
})




const logOutUser = asyncHandler(async (req, res) => {
try {
    
        const user = await User.findByIdAndUpdate(req.user._id, {$set: {refreshToken: undefined}}, {new: true})
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        // Clear access token cookie
        res.clearCookie("accessToken", options)
    
        // Clear refresh token cookie
        res.clearCookie("refreshToken", options)
    
        return res.status(200).json({ message: 'Logout successful' });
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
}
})




const refreshAccesToken = asyncHandler(async (req, res) => {
    const incomingRefressToken = req.cookies?.refreshToken
    // console.log(incomingRefressToken);
    if (!incomingRefressToken) {
        return res.status(401).json({message: 'unAuthorized request'})
    }

    const decodeToken = await Jwt.verify(incomingRefressToken, process.env.REFERENCE_TOKEN_SECRET)
    const user = await User.findById(decodeToken._id)
    if (!user) {
        return res.status(401).json({message: 'invalid RefressToken'})
    }

    if (incomingRefressToken !== user.refreshToken) {
        return res.status(401).json({message: ' RefressToken expire'})
    }

    
     const option = {
        httpOnly: true,
        secure: true
        }

    const {accessToken, refreshToken: newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    return res.status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", newRefreshToken, option)
    .json({ accessToken, refreshToken:newRefreshToken, message: "new refresh Token created successfully "})

})




const changeCurrentPasword = asyncHandler(async (req, res) => {
    const {password, newPassword} = req.body

    
   // Find the user by ID
    const user = await User.findById(req.user._id)

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Check if the old password matches the user's current password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid password' });
    }

    // Update the user's password with the new password
    user.password = newPassword

    // Save the user document with the updated password\
    await user.save({validateBeforeSave: false})

    return res.status(200).json({ message: 'Password updated successfully' });
})



const getCurrentUser = asyncHandler(async (req, res) => {
    const user = req.user
    return res.status(200).json({user, message:'Current user fetched successfully'})
})




const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email } = req.body
    console.log(`${fullName} and ${email}`);

    if (!fullName || !email) {
      return res.status(400).json('All fields are required');
    }

    const user = await User.findByIdAndUpdate(req.user._id, {$set: {fullName, email}}, {new: true, select: '-password -refreshToken'})
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
console.log(user);
    // Respond with updated user details
    res.status(200).json({user, message:'Account upDate successfully'})

})




export { registerUser, loginUser, logOutUser, refreshAccesToken, changeCurrentPasword, getCurrentUser, updateAccountDetails }


