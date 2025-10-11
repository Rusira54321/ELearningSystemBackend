const router = require("express").Router()
const {verifyAdminToken,getTotalStudentsCount,getTotalTeachersCount,
    getTotalCourse,getMonthRevenue,getAllCourses,
    getStudents,getTeachers,deleteTeachersById,getMonthlyEnrollments,getMonthlyRevenue} = require("../controller/AdminController")
const {authmiddlware} = require("../Middleware/Admin")
router.post("/verifyadmintoken",verifyAdminToken)
router.get("/studentCount",authmiddlware,getTotalStudentsCount)
router.get("/teachersCount",authmiddlware,getTotalTeachersCount)
router.get("/getTotalCourse",authmiddlware,getTotalCourse)
router.get("/getMonthRevenue",authmiddlware,getMonthRevenue)
router.get("/getAllCourses",authmiddlware,getAllCourses)
router.get("/getStudents",authmiddlware,getStudents)
router.get("/getTeachers",authmiddlware,getTeachers)
router.post("/deleteTeachers",authmiddlware,deleteTeachersById)
router.get("/getMonthlyEnrollments",authmiddlware,getMonthlyEnrollments)
router.get("/getMonthlyRevenue",authmiddlware,getMonthlyRevenue)
module.exports = router