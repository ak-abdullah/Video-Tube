import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    let isLiked = false;
    const like = await Like.findOne({ video: videoId, likedBy: req.user._id })

    if (!like) {
        const newLike = await Like.create({ video: videoId, likedBy: req.user._id })
        isLiked = true
    }
    else {
        await like.deleteOne()
        isLiked = false
    }

    return res.status(200).json(
        new ApiResponse(200, {
            isLiked: isLiked
        }, isLiked ? "Video liked" : "Video unliked")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    let isLiked = false
    //TODO: toggle like on comment
    const like = await Like.findOne({ comment: commentId, likedBy: req.user._id })
    if (!like) {
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })
        isLiked = true
    }
    else {
        await like.deleteOne()
        isLiked = false
    }

    return res.status(200).json(
        new ApiResponse(200, {
            isLiked: isLiked
        }, isLiked ? "Comment liked" : "Comment unliked")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet

    let isLiked = false
    //TODO: toggle like on comment
    const like = await Like.findOne({ tweet: tweetId, likedBy: req.user._id })
    if (!like) {
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })
        isLiked = true
    }
    else {
        await like.deleteOne()
        isLiked = false
    }

    return res.status(200).json(
        new ApiResponse(200, {
            isLiked: isLiked
        }, isLiked ? "Tweet liked" : "Tweet unliked")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const result = await Like.aggregate([
        {
            $match: { likedBy: new mongoose.Types.ObjectId(req.user._id), video: { $exists: true, $ne: null } }

        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $sort: {
                createdAt: -1 // -1 means Descending (Newest first)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "videoDetails.owner",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        {
            $unwind: "$userDetails"
        },
        {
            $project: {
                _id: 1,
                title: "$videoDetails.title",
                thumbnail: "$videoDetails.thumbnail",
                videoFile: "$videoDetails.videoFile",
                duration: "$videoDetails.duration",
                views: "$videoDetails.views",
                owner: {
                    username: "$userDetails.username",
                    fullName: "$userDetails.fullName",
                    avatar: "$userDetails.avatar"
                    // Notice we DO NOT include password or email here!
                }
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200, {
            likedVideos: result
        }, "Liked videos fetched successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}