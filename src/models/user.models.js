import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import  Jwt  from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    fullName: {
      type: String,
      required: true,
      unique: true
    },
    userName: {
      type: String,
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    avatar: {
      type: String,
      required: true
    },
    coverImg: {
      type: String,
    },
    refreshToken: {
      type: String,
    }
  }, {
    timestamps: true
  });
  
  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10)
  })

  userSchema.methods.isPasswordCorrect = async function (password) {
    if (!password) {
        throw new Error("Password required");
      }
   return await bcrypt.compare(password, this.password)
  }

  userSchema.methods.generateAccessToken =  function () {
    return Jwt.sign({
        _id: this._id
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE
    })
  }

  userSchema.methods.generateReferenceToken =  function () {
    return Jwt.sign({
        _id: this._id
    }, process.env.REFERENCE_TOKEN_SECRET, {
        expiresIn: process.env.REFERENCE_TOKEN_EXPIRE
    })
  }

  export const User = mongoose.model("User", userSchema)