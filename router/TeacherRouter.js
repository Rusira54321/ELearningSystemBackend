const router = require("express").Router()
const {getTeacherIdByToken} = require("../controller/TeacherController")
router.post("/getteacherid",getTeacherIdByToken)
module.exports = router