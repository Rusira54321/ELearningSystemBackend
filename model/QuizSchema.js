const mongoose = require("mongoose")
const { validate } = require("./Course")

const QuizSchema = mongoose.Schema({
    courseId:{type:mongoose.Schema.Types.ObjectId,ref:"Course",required:true},
    teacherId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    title:{type:String,required:true},
    description:{
        type:String,required:true
    },
    questions:{
        type:[
        {
            questionText:{
                type:String,
                required:true
            },
            options:
            {
                type:[String],
                required:true,
                validate:[arr=>arr.length>0,"At least one question is required"] //must have at least 1
            },
            correctAnswer:{
                type:Number,
                required:true  //index of correct option
            }
        },
        ],
        required:true,
        validate:[arr=>arr.length>0,"At least one question is required"]  //must have at least 1
    }
    ,
    createdAt:{
        type:Date,
        default:Date.now
    },
})

module.exports = mongoose.model("Quiz",QuizSchema)