const {loginUserService} = require("../services/loginService")

const loginUser = async(req,res) =>{
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json({message: "Please provide your email and password"});
    }

    try{
        const result = await loginUserService({email, password});
        return res.status(200).json(result)
    }catch(error){
        res.status(404).json({message:error.message})
    }
};

module.exports = {loginUser};






