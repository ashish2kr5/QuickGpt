import express from "express"
import { protect } from "../middlewares/auth.js"
import { textMessageController } from "../controllers/messageController.js"
import { imageMessageController } from "../controllers/messageController.js"
import { getCommunityImages } from "../controllers/messageController.js"

const messageRouter = express.Router()


messageRouter.post('/text',protect,textMessageController)

messageRouter.post('/image',protect,imageMessageController)

messageRouter.get('/community',getCommunityImages)

export default messageRouter