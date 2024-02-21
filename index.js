import app from "./app.js";
import connectDB from "./src/db/index.js";
import dotenv from "dotenv"
dotenv.config()
const port = process.env.PORT || 5000


connectDB()
.then(()=> {
    app.listen(port, () => {
        console.log(`server listen on port: ${port}`);
    })
})
.catch((error) => {
    console.log("mongodb connection faild !!!", error);
})