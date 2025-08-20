const express = require("express")
const router = express.Router()
const {registerUser} = require("../controller/Usercontroller")
const {upload} =require("../Middleware/Multer")
router.post("/register",upload.single("profilePicture"),registerUser)
module.exports = router