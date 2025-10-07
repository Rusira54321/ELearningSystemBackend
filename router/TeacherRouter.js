const router = require("express").Router()
const {createCourse} = require("../Middleware/Course")
const {getTeacherIdByToken,getCourseEnrolledStudents,createQuize} = require("../controller/TeacherController")
router.post("/getteacherid",getTeacherIdByToken)
router.post("/getEnrolledStudents",createCourse,getCourseEnrolledStudents)
router.post("/createQuiz",createCourse,createQuize)
module.exports = router