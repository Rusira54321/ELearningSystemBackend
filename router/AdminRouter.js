const router = require("express").Router()
const {verifyAdminToken} = require("../controller/AdminController")

router.post("/verifyadmintoken",verifyAdminToken)

module.exports = router