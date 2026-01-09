import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { upload } from '../middlewares/multer.middleware.js'
import { ApiResponse } from '../utils/ApiResponse.js'


generateAcessAndRefreshToken = async (userId) => {
    try{
    const accessToken = userId.generateAccessToken()
    const refreshToken = userId.generateRefreshToken()

    userId.refreshToken = refreshToken
    await userId.save({validateBeforeSave: false})

    return { accessToken, refreshToken }
    }
    catch(error){
        throw new ApiError(500, "Failed to generate access and refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    console.log("What is request body in user controller: ", req.body)
    const { fullName, email, password, username } = req.body
    if ([fullName, email, password, username].some(field => field?.trim() === "")) {
        throw new ApiError(400, 'All fields are required')
    }
    console.log(fullName, email, password, username)

    const existedUser = await User.findOne(
        {
            $or: [{ username }, { email }]
        }
    )
    if (existedUser) {
        throw new ApiError(409, "User with name or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Failed to upload avatar to cloudinary")
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    )
})


const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body

    if (!email && !username) {
        throw new ApiError(404, "Email or username is required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    })

    if(!user) {
        throw new ApiError(404, "User is not registered")
    }

    const isPasswordCorrect = await user.comparePassword(password)

    if(!isPasswordCorrect) {
        throw new ApiError(404, "Invalid password")
    }

    const { accessToken, refreshToken } = await generateAcessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken,
        }, "User logged in successfully")
    )
})


//secured routes
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, {
        $set: {refreshToken: undefined},
    }, {
        new: true,
    })
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(
        new ApiResponse(200, null, "User logged out successfully")
    )
})
export { registerUser, loginUser, logoutUser }

