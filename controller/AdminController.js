const jwt = require("jsonwebtoken")
const user = require("../model/User")
require("dotenv").config()
const course = require("../model/Course")
const announcement = require("../model/Announcement")
const enrollment = require("../model/Enrollement")
const payment = require("../model/Payment")
const quiz  = require("../model/QuizSchema")
const quizSubmission = require("../model/QuizSubmissionSchema")
const secretkey = process.env.JWT_SECRET
const verifyAdminToken = (req,res) =>{
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
                      if(matcheduser.role=="Teacher" || matcheduser.role=="Student")
                      {
                            return res.status(403).json({message:"You are not Admin"})
                      }
                      return res.status(200).json({message:"User is valid",userid:id})
                }
                finduser()
            })
}

const getTotalStudentsCount = async(req,res) =>{
    try{
        const Students = await user.find({role:"Student"})
        return res.status(200).json({studentCount:Students.length})
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }
}

const getTotalTeachersCount = async(req,res) =>{
    try{
    const teachersCount = await user.countDocuments({role:"Teacher"})
    return res.status(200).json({teachersCount:teachersCount})
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }
}

const getTotalCourse = async(req,res) =>{
    try{
    const courseCount = await course.countDocuments()
    return res.status(200).json({courseCount})
    }catch(err)
    {
        return res.status(500).json({error:err.message})
    }
}

const getMonthRevenue = async(req,res) =>{
    try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const result = await payment.aggregate([
      {
        $match: {
          transactionTime: {
            $gte: startOfMonth,
            $lte: endOfMonth,
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;

    return res.status(200).json({ month: now.getMonth() + 1, totalRevenue });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
}

const getAllCourses = async(req,res) =>{
  try{
  const courses = await course.find().populate("teacher","FullName email")
  return res.status(200).json({courses})
  }catch(err)
  {
    return res.status(500).json({error:err.message})
  }
} 

const getStudents = async(req,res) =>{
  try{
  const students = await user.find({role:"Student"})
  return res.status(200).json({students})
  }catch(err)
  {
    return res.status(500).json({error:err.message})
  }
}

const getTeachers = async(req,res) =>{
  try{
  const teachers = await user.find({role:"Teacher"})
  return res.status(200).json({teachers})
  }catch(err)
  {
    return res.status(500).json({error:err.message})
  }
}

const deleteTeachersById = async(req,res) =>{
 try {
    const { teacherId } = req.body;

    if (!teacherId) {
      return res.status(400).json({ message: "Request body must include teacherId" });
    }

    // Step 1: Delete the teacher
    const deletedTeacher = await user.findByIdAndDelete(teacherId);
    if (!deletedTeacher) {
      return res.status(404).json({ message: "Teacher not found or already deleted" });
    }

    // Step 2: Find all courses created by this teacher
    const courses = await course.find({ teacher: teacherId }).select("_id");
    const courseIds = courses.map((c) => c._id);

    // Step 3: Delete enrollments linked to those courses
    await enrollment.deleteMany({ courseID: { $in: courseIds } });

    // Step 4: Remove deleted courses from students' enrolledCourses list
    await user.updateMany(
      { "enrolledCourses.courseID": { $in: courseIds } },
      { $pull: { enrolledCourses: { courseID: { $in: courseIds } } } } // ✅ fixed the wrong variable "id"
    );

    // Step 5: Delete all courses of that teacher
    await course.deleteMany({ teacher: teacherId });

    // Step 6: Delete all announcements created by that teacher
    await announcement.deleteMany({ teacherId: teacherId });

    // Step 7: Delete all quizzes and their submissions
    const quizes = await quiz.find({ teacherId: teacherId }).select("_id");
    const quizIds = quizes.map((q) => q._id);

    await quizSubmission.deleteMany({ quizId: { $in: quizIds } });
    await quiz.deleteMany({ teacherId: teacherId });

    // ✅ Step 8: Send response
    return res.status(200).json({
      message: "Teacher and all related data deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const getMonthlyEnrollments = async(req,res) =>{
  try {
    // Aggregate enrollments by month
    const monthlyEnrollments = await enrollment.aggregate([
      {
        $group: {
          _id: { $month: "$enrolledAt" }, // group by month
          count: { $sum: 1 },             // count enrollments
        },
      },
      {
        $sort: { "_id": 1 }, // sort by month
      },
    ]);

    // Map month number to month name for readability
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const formattedData = monthlyEnrollments.map((item) => ({
      month: monthNames[item._id - 1],
      enrollments: item.count,
    }));

    res.status(200).json({ monthlyEnrollments: formattedData });
  } catch (err) {
    console.error("Error getting monthly enrollments:", err);
    res.status(500).json({ message: "Server error" });
  }
}

const getMonthlyRevenue = async(req,res) =>{
  try {
    // Aggregate payments by month
    const monthlyRevenue = await payment.aggregate([
      {
        $group: {
          _id: { $month: "$transactionTime" }, // group by month
          totalRevenue: { $sum: "$amount" },   // sum of payments
        },
      },
      {
        $sort: { "_id": 1 }, // sort by month (Jan → Dec)
      },
    ]);

    // Map month number to month name
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const formattedData = monthlyRevenue.map((item) => ({
      month: monthNames[item._id - 1],
      revenue: item.totalRevenue,
    }));

    res.status(200).json({ monthlyRevenue: formattedData });
  } catch (err) {
    console.error("Error fetching monthly revenue:", err);
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = {verifyAdminToken,getTotalStudentsCount,getTotalTeachersCount,
  getTotalCourse,getMonthRevenue,
  getAllCourses,getStudents,
  getTeachers,deleteTeachersById,
  getMonthlyEnrollments,getMonthlyRevenue}