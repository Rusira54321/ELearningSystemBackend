const jwt = require("jsonwebtoken")
const user = require("../model/User")
const course = require("../model/Course")
const enrollment = require("../model/Enrollement")
const quiz = require("../model/QuizSchema")
const quizSubmission = require("../model/QuizSubmissionSchema")
const announcement = require("../model/Announcement")
require("dotenv").config()
const secretkey = process.env.JWT_SECRET
const getTeacherIdByToken  = (req,res) =>{
    try{
   const authHeader = req.header("Authorization")
           if(!authHeader)
           {
               return res.status(401).json({message:"Unauthorized:missing token"})
           }
           const [bearer,token] = authHeader.split(" ")
           if(bearer!=="Bearer" || !token)
           {
               return res.status(401).json({message:"unauthorized:Invalid token format"})
           }
           jwt.verify(token,secretkey,(err,payload)=>{
               if(err)
               {
                   return res.status(401).json({message:"Forbidden: Invalid token"})
               }
               const id = payload.id
               const finduser = async() =>{
                     const matcheduser =   await user.findById(id)
                     if(!matcheduser)
                     {
                        return res.status(404).json({message:"User not found"})
                     }
                     if(matcheduser.role=="Student" || matcheduser.role=="Admin")
                     {
                        return res.status(403).json({message:"You are not teacher"})
                     }
                     return res.status(200).json({teacherid:id})
               }
               finduser()
           })
        }catch(err)
        {
            return res.status(500).json({message:"Internal server error"})
        }

}

const getCourseEnrolledStudents = async(req,res) =>{
    const {teacherId} = req.body
    if(!teacherId)
    {
        return res.status(400).json({message:"Request has an error"})
    }
    try{
    const courses = await course.find({teacher:teacherId}).populate('enrollStudents.StudentID', 'FullName email');
    if(!courses || courses.length === 0)
    {
        return res.status(404).json({message:"no courses found for this teacher"})
    }
    return res.status(200).json({courses})
}catch(err)
{
    return res.status(500).json({err})
}
}

const getNumberOFTotalStudents = async(req,res) =>{
    const {teacherId} = req.body
    if(!teacherId)
    {
        return res.status(400).json({message:"Request has an error"})
    }
    try{
    const courses = await course.find({teacher:teacherId}).populate('enrollStudents.StudentID', 'FullName email')
    const students = []
    let studentCount = 0
    for(const course of courses)
    {
        for(const student of course.enrollStudents)
        {
                if(!students.includes(student.StudentID._id))
                {
                    studentCount++
                    students.push(student.StudentID._id)
                }
        }
    }
    return res.status(200).json({studentCount})
}catch(err)
{
    return res.status(500).json({error:err.message})
}
}

const createQuize = async(req,res) =>{
    try{
        const Quiz = new quiz(req.body)
        await Quiz.save()
        return res.status(201).json({success:true})
    }catch(error)
    {
        return res.status(500).json({success:false,error:error.message})
    }
}

const addAnnouncements = async(req,res) =>{
    try{
    const {title,description,CourseId,teacherId} = req.body
    if(!title || !description || !CourseId)
    {
        return res.status(400).json({message:"Missing Fields"})
    }
    if(!req.files || Object.keys(req.files).length==0)
    {
        return res.status(400).json({message:"No files uploaded"})
    }
    const Announcement = {
        CourseId:CourseId,
        teacherId:teacherId,
        title:title,
        Description:description,
        OtherMaterials:[]
    }
    if(req.files.others && Array.isArray(req.files.others))
    {
        req.files.others.forEach((file)=>{
            Announcement.OtherMaterials.push({title:file.originalname,Url:file.filename})
        })
    }
    const newAnnouncement = new announcement(Announcement)
    await newAnnouncement.save()
    return res.status(201).json({message:"Announcement is created"})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
}
const countNumberOfCoursesByTeacherId = async(req,res) =>{
    const {teacherId} = req.params
    try{
    const count = await course.countDocuments({teacher:teacherId})
    return res.status(200).json({count})
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }
}
const countNumberOfQuizesByTeacherId = async(req,res) =>{
    try{
    const {teacherId} = req.params
    const count = await quiz.countDocuments({teacherId:teacherId})
    return res.status(200).json({count})
}catch(err)
{
    return res.status(500).json({error:err.message})
}
}
const getAllQuizesByTeacherId = async(req,res) =>{
    const {teacherId} = req.params
    try{
        const quizes = await quiz.find({teacherId:teacherId}).populate('courseId', 'title').sort({createdAt:-1})
        return res.status(200).json({quizes})
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }
}
const getQuizById = async(req,res) =>{
    const {quizId} = req.params
    try{
    const matchedQuiz = await quiz.findById(quizId).populate('courseId', 'title')
    if(matchedQuiz==null)
    {
        return res.status(404).json({message:"Quize not found"})
    }
    return res.status(200).json({matchedQuiz})
}catch(err)
{
    return res.status(500).json({error:err.message})
}
}
const getquizResultByQuizId = async(req,res) =>{
    const {quizId} = req.params
    try{
    const quizeSubmissions = await quizSubmission.find({quizId:quizId}).populate('studentID','FullName email')
    return res.status(200).json({quizeSubmissions})
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }

}
const deleteQuizes = async(req,res) =>{
    const {quizId} = req.params
    try{
    await quiz.findByIdAndDelete(quizId)
    await quizSubmission.deleteMany({quizId:quizId})
    return res.status(200).json({message:"Delete successful"})
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }
}

const deleteStudentByEmail = async(req,res) =>{
    const {studentID} = req.body
    try{
    const deleteUser = await user.findByIdAndDelete(studentID)
    if(!deleteUser)
    {
        return res.status(404).json({message:"User cant found"})
    }
    await enrollment.deleteMany({studentId:studentID})
    await quizSubmission.deleteMany({studentID:studentID})
    await course.updateMany({},
        {$pull:{enrollStudents:{StudentID:studentID}}}
    )
    return res.status(200).json({message:"Student deleted successfully"})
}catch(err)
{
    return res.status(500).json({error:err.message})
}

}

const getLatestEnrollmentStatus = async(req,res) =>{
    const {teacherId} = req.params
    if (!teacherId) {
      return res.status(400).json({ message: "Teacher ID is required" })
    }
    try{
    const teacherCourses = await course.find({teacher:teacherId}).select("_id")
    const courseIds = teacherCourses.map((course)=>course._id)
    if(courseIds.length==0)
    {
        return res.status(404).json({ message: "No courses found for this teacher" });
    }
    const enrollments = await enrollment.find({ courseID: { $in: courseIds } })
      .populate("courseID", "title teacher")
      .populate("studentId", "FullName email")
      .sort({ enrolledAt: -1 }).limit(5)
    if (enrollments.length === 0) {
      return res.status(404).json({ message: "No enrollments found for this teacher" });
    }
    return res.status(200).json({ enrollments });
}catch(err)
{
    return res.status(500).json({ message: err.message });
}
}

const getLatestQuizSubmissions = async(req,res) =>{
    const {teacherId} = req.params
    if(!teacherId)
    {
        return res.status(400).json({ message: "Teacher ID is required" })
    }
    try{
    const quizes = await quiz.find({teacherId}).select("_id")
    if(quizes.length==0)
    {
        return res.status(404).json({ message: "No quizes found for this teacher" })
    }
    const quizesIds = quizes.map((quizz)=>quizz._id)
    const quizSubmissions = await quizSubmission.find({ quizId: { $in: quizesIds } })
  .populate({
    path: "quizId",
    select: "title courseId",
    populate: { path: "courseId", select: "title" } // populate the course of the quiz
  })
  .populate("studentID", "FullName email") // student info
  .sort({ submittedAt: -1 }) // latest first
  .limit(5)
  if(quizSubmissions.length==0)
  {
    return res.status(404).json({ message: "No Quiz submissions found for this teacher" });
  }
  return res.status(200).json({quizSubmissions})
}catch(err)
{
    return res.status(500).json({ message: err.message });
}
}
module.exports = {getTeacherIdByToken,getCourseEnrolledStudents,createQuize,
    addAnnouncements,addAnnouncements,
    getNumberOFTotalStudents,
    countNumberOfCoursesByTeacherId,
    countNumberOfQuizesByTeacherId,
    getAllQuizesByTeacherId
    ,getQuizById,getquizResultByQuizId,deleteQuizes
,deleteStudentByEmail,getLatestEnrollmentStatus
,getLatestQuizSubmissions}