import express  from "express";
const app = express()
import cookieParser from "cookie-parser";

// middlewares
app.use(express.json({limit: '17kb'}))
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())
app.use(express.static("public"));


import userRouter from "./src/routes/user.routes.js"

app.use('/users', userRouter)



export default app