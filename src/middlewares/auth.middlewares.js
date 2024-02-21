import  Jwt  from "jsonwebtoken";
import { User } from "../models/user.models.js";


// Middleware to verify JWT token
export const verifyjwt = async (req, res, next) => {
 try {
   const token = req.cookies?.accessToken   || req.headers['authorization'];
 
   if (!token) {
     return res.status(401).json({ message: 'Authorization token is required' });
   }
 
   const decoded = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET )
   const user = await User.findById(decoded._id).select(" -password -refreshToken")
   if (!user) {
     res.status(401).json({ message: 'Invalid token'})
   }
 
   req.user = user 
   next()
 } catch (error) {
  console.log("auth error",error);
 }
}