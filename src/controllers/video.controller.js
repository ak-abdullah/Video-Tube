import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination

  const pipeline = [];
  if (query) {
    pipeline.push({
      $match: {
        $or: [
          {
            title: { $regex: query, $options: "i" },
          },
          {
            description: { $regex: query, $options: "i" },
          },
        ],
      },
    });
  }

  if (userId) {
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  pipeline.push({
    $match: {
      isPublished: true,
    },
  });

  const sortByField = sortBy || "createdAt";

  const sortTypeField = sortType?.toLowerCase() == "desc" ? -1 : 1;

  pipeline.push({
    $sort: {
      [sortByField]: sortTypeField,
    },
  });

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  console.log("What is pipeline: ", pipeline);
  const videoAggregate = Video.aggregate(pipeline);
  const result = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const { videoFile, thumbnail } = req.files;

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }

  const videoLocalUrl = videoFile?.[0]?.path;
  const thumbnailLocalUrl = thumbnail?.[0]?.path;

  //now upload to cloudinary
  const videoUploaded = await uploadOnCloudinary(videoLocalUrl);

  //   console.log("Just for checking video duration: ", videoUploaded);

  const thumbnailUploaded = await uploadOnCloudinary(thumbnailLocalUrl);

  if (!videoUploaded?.url || !thumbnailUploaded?.url) {
    throw new ApiError(
      400,
      "Failed to upload video and thumbnail to cloudinary"
    );
  }

  const duration = videoUploaded?.duration;

  const video = await Video.create({
    videoFile: videoUploaded.url,
    thumbnail: thumbnailUploaded.url,
    title,
    description,
    duration,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(500, "Failed to create video");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
  ]);
  if (!video?.length) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched successfully"));
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
