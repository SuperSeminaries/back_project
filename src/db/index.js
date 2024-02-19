import mongoose from "mongoose"
import { DB_NAME } from "../../constants.js"




const connectDB = async(req, res) => {
try {
        const connection = await mongoose.connect(`${process.env.MONGO_URI}/${ DB_NAME }`)
        console.log(`mongoDB connected || DB HOST: ${connection.connection.host}`);
} catch (error) {
    console.log("masseg", error);
}
}

export default connectDB
