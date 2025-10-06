const router = require("express").Router()
const {createCourse} = require("../Middleware/Course")
const {getTeacherIdByToken,getCourseEnrolledStudents} = require("../controller/TeacherController")
router.post("/getteacherid",getTeacherIdByToken)
router.post("/getEnrolledStudents",createCourse,getCourseEnrolledStudents)
module.exports = router