const jwt = require("jsonwebtoken")
const user = require("../model/User")
const Course = require("../model/Course")
require("dotenv").config()
const Stripesecret = process.env.STRIPE_SECRET_KEY
const stripe=require("stripe")(Stripesecret)
const secretkey = process.env.JWT_SECRET
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
            console.log("Webhook called successful");
            }catch(error)
            {
                console.log(error)
                return
            }

        }
}
module.exports = {verifyStudentTokens,enrollStudents,StripeIntegrationForEnrolment,stripeWebhook}