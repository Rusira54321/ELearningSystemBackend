const jwt = require("jsonwebtoken")
const user = require("../model/User")
const course = require("../model/Course")
const quiz = require("../model/QuizSchema")
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


module.exports = {getTeacherIdByToken,getCourseEnrolledStudents,createQuize}