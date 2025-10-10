const jwt = require("jsonwebtoken")
const user = require("../model/User")
const Course = require("../model/Course")
require("dotenv").config()
const announcement = require("../model/Announcement")
const Stripesecret = process.env.STRIPE_SECRET_KEY
const stripe=require("stripe")(Stripesecret)
const secretkey = process.env.JWT_SECRET
const enrollment = require("../model/Enrollement")
const quiz = require("../model/QuizSchema")
const quizSubmission = require("../model/QuizSubmissionSchema")
const verifyStudentTokens = (req,res) =>{
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
                      if(matcheduser.role=="Teacher" || matcheduser.role=="Admin")
                      {
                            return res.status(403).json({message:"You are not Student"})
                      }
                      return res.status(200).json({message:"User is valid",userid:id})
                }
                finduser()
            })
}

const enrollStudents = async(req,res) =>{
    const {courseId,userId} = req.body
    if(!courseId || !userId)
    {
        return res.status(400).json({message:"request has an error"})
    }
    try{
        const course = await Course.findById(courseId)
        if(course==null)
        {
            return res.status(404).json({message:"Course is not found"})
        }
        const existUser = await user.findById(userId)
        if(existUser==null)
        {
            return res.status(404).json({message:"User is not found"})
        }
        const enrolledStudents = course.enrollStudents
        for(const student of enrolledStudents)
        {
            if(student.StudentID==userId)
            {
                return res.status(400).json({ message: "User already enrolled in this course" })
            }
        }
        const newEnrollment = new enrollment({
            courseID:courseId,
            studentId:userId
        })
        await newEnrollment.save()
        course.enrollStudents.push({
            StudentID:userId
        })
        await course.save()
        existUser.enrolledCourses.push({
            courseID:courseId
        })
        await existUser.save()
        return res.status(201).json({message:"Student enrolled successful"})
    }catch(error)
    {
        return res.status(500).json({message:error.message})
    }
}

const StripeIntegrationForEnrolment = async(req,res) =>{
    const {items,courseId,userId} = req.body
    try{
        const course = await Course.findById(courseId)
        if(course==null)
        {
            return res.status(404).json({message:"Course is not found"})
        }
        const enrolledStudents = course.enrollStudents
        for(const student of enrolledStudents)
        {
            if(student.StudentID==userId)
            {
                return res.status(400).json({ message: "User already enrolled in this course" })
            }
        }
    }catch(error)
    {
        return res.status(500).json({error})
    }
    const lineItems = items.map((item)=>(
        {
            price_data:{
                currency:"usd",
                product_data:{
                    name:item.name,
                },
                unit_amount:Math.round(item.priceUSD*100),
            },
            quantity:item.quantity
        }
    ))
    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types:["card"],
            line_items:lineItems,
            mode:"payment",
            success_url:`http://localhost:3000/student/courseInclude/${courseId}`,
            cancel_url:`http://localhost:3000/student/courseDetails/${courseId}`,
            metadata:{
                items:JSON.stringify(items),
                courseId:courseId,
                userId:userId
            }      
        })
        res.status(200).json({url: session.url})
    }catch(error)
    {
        return res.status(404).json({message:error})
    }
}

const stripeWebhook = async(req,res) =>{
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.WEB_HOOK_SECRET
    let event
     try {
            event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
        } 
        catch (err) {
            console.log("❌ Webhook signature failed:", err.message);
            return
        }
        if(event.type==="checkout.session.completed")
        {
            const session = event.data.object
            const items = JSON.parse(session.metadata.items)
            const courseId = session.metadata.courseId
            const userId = session.metadata.userId
            try{
            const course = await Course.findById(courseId)
            if(course==null)
            {
                console.log("Course is not found")
                return
            }
            const matchEnrollment = await enrollment.findOne({courseID:courseId,
                studentId:userId
            })
            if(matchEnrollment)
            {
                console.log("this user is already enrolled to this course")
                return
            }
            course.enrollStudents.push({
                StudentID:userId
            })
            await course.save()
            const matchedUser = await user.findById(userId)
            if(matchedUser==null)
            {
                console.log("User is not found")
                return
            }
            matchedUser.enrolledCourses.push({
                courseID:courseId
            })
            await matchedUser.save()
            const newEnrollment = new enrollment({
                courseID:courseId,
                studentId:userId
            })
            await newEnrollment.save()
            console.log("Webhook called successful");
            }catch(error)
            {
                console.log(error)
                return
            }

        }
}

const getQuizesbyCourse = async(req,res) =>{
    try{
        const {courseId} = req.params
        const quizzes = await quiz.find({courseId:courseId})
        if(quizzes.length==0)
        {
            return res.status(404).json({message: "No quizzes found for this course"})
        }
        return res.status(200).json(quizzes)
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }
}

const submitQuiz = async(req,res) =>{
    try{
    const {quizId,studentId,answers} = req.body
    if(!quizId || !studentId || !answers)
    {
        return res.status(400).json({message:"All fields are required"})
    }
    const existSubmission = await quizSubmission.findOne({quizId:quizId,studentID:studentId})
    if(existSubmission)
    {
        return res.status(400).json({message: "You have already submitted this quiz"})
    }
    const MatchedQuiz= await quiz.findById(quizId)
    if(MatchedQuiz==null)
    {
        return res.status(404).json({message:"Quiz is not found"})
    }
    let score = 0;
    MatchedQuiz.questions.forEach((q,index)=>{
        if(answers[index]===q.correctAnswer)
            {
                score++
            }        
    });
    const submission = new quizSubmission({
        quizId:quizId,
        studentID:studentId,
        answers:answers,
        score:score
    })
    await submission.save()
    return res.status(201).json({message:"Submit successful",score})
    }catch(err)
    {
        return res.status(500).json({message:err.message})
    }
}
const getQuizById = async(req,res) =>{
    const {quizId} = req.params
    try{
    const Quiz = await quiz.findById(quizId)
    if(Quiz==null)
    {
        return res.status(404).json({message:"Quiz is not found"})
    }
        return res.status(200).json({Quiz})
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }
}
const getStudentAnnouncements = async (req, res) => {
  try {
    const { studentId } = req.params

    // 1. Find the student
    const student = await user.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // 2. Extract enrolled course IDs
    const courseIds = student.enrolledCourses.map(c => c.courseID)

    if (!courseIds || courseIds.length === 0) {
      return res.status(200).json({ message: "No enrolled courses", announcements: [] })
    }

    // 3. Find all announcements for those courses
    const announcements = await announcement.find({
      CourseId: { $in: courseIds }
    })
      .populate("CourseId", "title")  // get course title
      .populate("teacherId", "FullName email") // get teacher info
      .sort({ createdAt: -1 }) // latest first

    // 4. Send response
    return res.status(200).json({
      count: announcements.length,
      announcements
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Server error", error: err.message })
  }
}
const countTotalEnrolledCourses = async(req,res) =>{
    const {studentId} = req.params
    try{
    const Student = await user.findById(studentId)
    if(Student==null)
    {
        return res.status(404).json({message:"User not found"})
    }
    const enrolledCourseCount = Student.enrolledCourses.length
    return res.status(200).json({enrolledCourseCount})
}catch(err)
{
    return res.status(500).json({error:err.message})
}
}
const totalCourses = async(req,res) =>{
    try{
        const totalCourses = await Course.countDocuments()
        return res.status(200).json({totalCourses})
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }
}

const totalCompletedQuizes = async(req,res) =>{
    const {studentId} = req.params
    if(!studentId)
    {
        return res.status(400).json({message:"StudentId is required"})
    }
    try{
    const student = await user.findById(studentId)
    if(student==null)
    {
        return res.status(404).json({message:"User is not found"})
    }
    const enrolledCoursesArray = student.enrolledCourses
    let coursesIds = []
    for(const courses of enrolledCoursesArray)
    {
        coursesIds.push(courses.courseID)
    }
    if(coursesIds.length==0)
    {
        return res.status(200).json({submissionCount:0})
    }
    const quizes = await quiz.find({courseId:{ $in: coursesIds }}).select("_id")
    if(quizes.length==0)
    {
        return res.status(200).json({submissionCount:0})
    }
    let quizesIds = []
    for(const quize of quizes)
    {
        quizesIds.push(quize._id)
    }
    const submissionCount = await quizSubmission.countDocuments({
        quizId:{ $in: quizesIds },
        studentID:studentId
    })
    return res.status(200).json({submissionCount})
}catch(err)
{
    return res.status(500).json({error:err.message})
}
}

const pendingQuizes = async(req,res) =>{
    const {studentId} = req.params
    if(!studentId)
    {
        return res.status(400).json({message:"StudentId is required"})
    }
    try{
    const student = await user.findById(studentId)
    if(student==null)
    {
        return res.status(404).json({message:"User is not found"})
    }
    const enrolledCoursesArray = student.enrolledCourses
    let coursesIds = []
    for(const courses of enrolledCoursesArray)
    {
        coursesIds.push(courses.courseID)
    }
    if(coursesIds.length==0)
    {
        return res.status(200).json({pendingQuizesCount:0})
    }
    const quizes = await quiz.find({courseId:{ $in: coursesIds }}).select("_id")
    if(quizes.length==0)
    {
        return res.status(200).json({pendingQuizesCount:0})
    }
    let quizesIds = []
    for(const quize of quizes)
    {
        quizesIds.push(quize._id)
    }
    const submissionCount = await quizSubmission.countDocuments({
        quizId:{ $in: quizesIds },
        studentID:studentId
    })
    const pendingQuizesCount = quizesIds.length - submissionCount
    return res.status(200).json({pendingQuizesCount})
}catch(err)
{
     return res.status(500).json({error:err.message})
}
}

const getRecentAnnouncements = async(req,res) =>{
     try {
    const { studentId } = req.params

    // 1. Find the student
    const student = await user.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // 2. Extract enrolled course IDs
    const courseIds = student.enrolledCourses.map(c => c.courseID)

    if (!courseIds || courseIds.length === 0) {
      return res.status(200).json({ message: "No enrolled courses", announcements: [] })
    }

    // 3. Find all announcements for those courses
    const announcements = await announcement.find({
      CourseId: { $in: courseIds }
    })
      .populate("CourseId", "title")  // get course title
      .populate("teacherId", "FullName email") // get teacher info
      .sort({ createdAt: -1 }).limit(5) // latest first

    // 4. Send response
    return res.status(200).json({
      announcements
    })

  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: "Server error", error: err.message })
  }
}
module.exports = {verifyStudentTokens,enrollStudents,StripeIntegrationForEnrolment,
    stripeWebhook,getQuizesbyCourse,submitQuiz,getQuizById
    ,getStudentAnnouncements
    ,countTotalEnrolledCourses
    ,totalCourses,
    totalCompletedQuizes
    ,pendingQuizes
    ,getRecentAnnouncements 
}