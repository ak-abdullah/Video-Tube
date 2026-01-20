import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1. Get total subscribers (Keep this separate as it's a different collection)
    const subscriberCount = await Subscription.countDocuments({
        channel: userId
    });

    // 2. Get Video, Views, and Likes in ONE pipeline
    const videoStats = await Video.aggregate([
        {
            // Match all videos belonging to this user
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            // Join with Likes collection
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            // Group everything into one bucket
            $group: {
                _id: null,
                totalVideos: { $sum: 1 },
                totalViews: { $sum: "$views" },
                totalLikes: { $sum: { $size: "$likes" } } // Sum the length of the likes array for each video
            }
        }
    ]);

    const stats = {
        subscribers: subscriberCount || 0,
        views: videoStats[0]?.totalViews || 0,
        videos: videoStats[0]?.totalVideos || 0,
        likes: videoStats[0]?.totalLikes || 0
    };

    return res.status(200).json(
        new ApiResponse(200, stats, "Channel stats fetched successfully")
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { page = 1, limit = 12, sortBy = "createdAt", sortType = "desc" } = req.query;

    const pipeline = [
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1
            }
        }
    ]

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",
        }
    }

    const result = await Video.aggregatePaginate(Video.aggregate(pipeline), options)
    return res.status(200).json(
        new ApiResponse(200, result, "Channel videos fetched successfully")
    )
})

export {
    getChannelStats,
    getChannelVideos
}