import  Router  from "express";
import { registerUser, loginUser, logOutUser, refreshAccesToken, changeCurrentPasword, getCurrentUser, updateAccountDetails } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";
import { verifyjwt } from "../middlewares/auth.middlewares.js";
const router = Router()

router.route("/register").post(upload.fields([
    {name: 'avatar', maxCount: 1},
    {name: 'coverImg', maxCountL: 1}
]),registerUser)
router.route('/login').post(loginUser)
router.route('/logOut').post(verifyjwt,logOutUser)
router.route('/refreshToken').post(verifyjwt,refreshAccesToken)
router.route('/password').post(verifyjwt,changeCurrentPasword)
router.route('/currentUser').post(verifyjwt,getCurrentUser)
router.route('/upDateUser').patch(verifyjwt,updateAccountDetails)


export default router