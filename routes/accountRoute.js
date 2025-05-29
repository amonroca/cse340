const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

router.get("/login", accountController.buildLogin)
router.get("/register", accountController.buildRegister)
// router.post("/register", accountController.registerAccount)
router.post("/register", regValidate.registrationRules(), regValidate.checkRegData, accountController.registerAccount)

module.exports = router