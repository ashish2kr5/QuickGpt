import jwt from 'jsonwebtoken'
import UserModel from '../models/UserModel.js';

export const protect = async (req,res,next) => {
  let token = req.headers.authorization;

  try{

    const decoded = jwt.verify(token,process.env.JWT_SECRET)
    const userID = decoded.id;

    const user = await UserModel.findById(userID)

    if(!user){
      return res.json({success :false , message:"Not authorized,user not found"});
    }

    req.user = user;
    next();

  }
  catch(error){
      res.status(401).json({message:"not authorized , token failed"})
  }
}