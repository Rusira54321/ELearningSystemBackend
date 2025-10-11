const mongoose = require("mongoose")
const PaymentSchema = new mongoose.Schema({
    courseID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Course",
            required:true
        }
        ,
    studentId:{
             type:mongoose.Schema.Types.ObjectId,
             ref:"User",
             required:true
        },
    amount:{
        type:Number,
        required:true
    },
    transactionTime:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Payment",PaymentSchema)