//ai chat message
import crypto from "crypto"
import Chat from "../models/Chat.js"
import UserModel from "../models/UserModel.js"
import Community from "../models/Community.js"
import axios from "axios"
import openai from "../configs/openai.js"
import imagekit from "../configs/imageKit.js"


export const textMessageController = async(req,res)=>{
  try{
    const userId = req.user._id

    if(req.user.credits < 1){
        return res.json({success:false,message:"you don't have enough credits to use this feature"})
    }

    const {chatId,prompt} = req.body
    const chat = await Chat.findOne({userId,_id:chatId})

    chat.messages.push({role:"user",content:prompt,timestamp:Date.now(),isImage:false})



    const {choices} = await openai.chat.completions.create({
    model: "gemini-3-flash-preview",
    messages: [
       
        {
            role: "user",
            content: prompt,
        },
    ],
})

  const reply = {...choices[0].message,timestamp:Date.now(),isImage:false}
 res.json({success:true,reply})
  chat.messages.push(reply)

  await chat.save()

  await UserModel.updateOne({_id:userId},{$inc:{credits:-1}})

  }catch(error){
    res.json({success:false,message:error.message})

  }
}



export const imageMessageController = async(req,res)=>{
  try{
    const userId = req.user._id;

    if(req.user.credits < 2){
        return res.json({success:false,message:"you don't have enough credits to use this feature"})
    }

    const{prompt,chatId,isPublished} = req.body

    if(!prompt || !chatId){
      return res.json({success:false,message:"prompt and chatId are required"})
    }

    const chat = await Chat.findOne({userId,_id:chatId})

    if(!chat){
      return res.json({success:false,message:"Chat not found"})
    }

    //push user message

    chat.messages.push({
      role:"user",
      content:prompt,
      timestamp:Date.now(),
      isImage:false
    })

    //generate image using Pollinations API
    const encodedPrompt = encodeURIComponent(prompt)
    const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`

    //download image from Pollinations URL
    const aiImageResponse = await axios.get(generatedImageUrl,{responseType:"arraybuffer"})

    //convert to base64
    const base64Image = `data:image/jpeg;base64,${Buffer.from(aiImageResponse.data,'binary').toString('base64')}`

    //upload image to ImageKit
    const uploadResponse = await imagekit.upload({
      file:base64Image,
      fileName:`${Date.now()}.jpg`,
      folder:"quickgpt"
    })

    const reply = {
      role:"assistant",
      content:uploadResponse.url,
      timestamp:Date.now(),
      isImage:true,
      isPublished
    }

    chat.messages.push(reply)

    await chat.save()
    await UserModel.updateOne({_id:userId},{$inc:{credits:-2}})

    // Save to community if published
    if(isPublished) {
      await Community.create({
        userId,
        userName: req.user.name,
        imageUrl: uploadResponse.url,
        prompt
      })
    }

    return res.json({success: true, reply, url:uploadResponse.url})

  } catch(error){
    console.error("Image generation error:", error);
    res.json({success:false,message:error.message || "Error generating image"});
  }
}

export const getCommunityImages = async(req,res) => {
  try {
    const images = await Community.find().sort({createdAt: -1})
    res.json({success: true, images})
  } catch(error) {
    res.json({success: false, message: error.message})
  }
}