import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    let isSubscribed = false
    // TODO: toggle subscription
    const subscription = await Subscription.findOne({ subscriber: req.user._id, channel: channelId })
    if (!subscription) {
        await Subscription.create({ subscriber: req.user._id, channel: channelId })
        isSubscribed = true
    } else {
        await subscription.deleteOne()
    }
    return res.status(200).json(new ApiResponse(200, { isSubscribed }, "Subscription toggled successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    const subscribers = await Subscription.aggregate([
        {
            $match: { channel: new mongoose.Types.ObjectId(channelId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriber"
            }
        },

        {
            $unwind: "$subscriber"
        },
        {
            $project: {
                // Map the fields from the flattened subscriber object
                _id: "$subscriber._id",
                username: "$subscriber.username",
                fullName: "$subscriber.fullName",
                avatar: "$subscriber.avatar"
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel"
            }
        },

        {
            $unwind: "$channel"
        },
        {
            $project: {
                // Map the fields from the flattened subscriber object
                _id: "$channel._id",
                username: "$channel.username",
                fullName: "$channel.fullName",
                avatar: "$channel.avatar"
            }
        }
    ])
    return res.status(200).json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}