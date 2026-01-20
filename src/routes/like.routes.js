import { Router } from "express";

import {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
} from '../controllers/like.controller.js'

import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

router.get('/videos', getLikedVideos)
router.post('/toggle/c/:commentId', toggleCommentLike)
router.post('/toggle/v/:videoId', toggleVideoLike)
router.post('/toggle/t/:tweetId', toggleTweetLike)
router.use(verifyJwt)

export default router
