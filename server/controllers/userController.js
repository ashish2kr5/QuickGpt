//api to register user

import UserModel from "../models/UserModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";
import Chat from "../models/Chat.js"

//generate token

const generateToken =(id)=>{
  return jwt.sign({id},process.env.JWT_SECRET,{
    expiresIn:'60d'
  })
}

export const registerUser = async (req, res) =>{
    const {name , email , password } = req.body;

    try{
      const userExists = await UserModel.findOne({email})

      if(userExists){
        return res.json({success:false, message:"user already exists"})
      }

      const user = await UserModel.create({name,email,password})


      const token = generateToken(user._id)

      res.json({success:true,token})

    }
    catch(error){
     return  res.json({success:false,message: error.message})
    }
}

//Api to login user

export const loginUser = async (req, res) =>{

   const {email , password } = req.body;
   try{
      const user = await UserModel.findOne({email})
      if(user){
        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
          const token = generateToken(user._id);
          return res.json({success:true,token})
        }

      }

       return  res.json({success:false,message:"invalid email or password"})


   }
   catch(error){
     return  res.json({success:false,message: error.message})
    }
}

export const getUser = async (req, res) =>{
  try{
    const user = req.user;
    return res.json({success:true,user})

  }catch(error){
      return  res.json({success:false,message: error.message})
  }
}

//Api to get published images

export const getPublishedImages = async(req,res)=>{
  try{
    const publishedImagesMessages = await Chat.aggregate([
      {$unwind:"$messages"},
      {$match:{"messages.isPublished":true,"messages.isImage":true}},
      {$project:{_id:0,imageUrl:"$messages.content",
        userName :"$messages.userName",
      }}
    ])

   res.json({success:true,images:publishedImagesMessages.reverse()})

  }catch(error){
    return  res.json({success:false,message: error.message})
  }
}