const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")
const validate = require("../utilities/account-validation")
const utilities = require("../utilities/")

/* ***********************
 *  Account Routes
 *************************/

router.get("/", utilities.checkLogin, accountController.buildAccountManagement)
router.get("/login", accountController.buildLogin)
router.get("/register", accountController.buildRegister)
router.post("/register", validate.registrationRules(), validate.checkRegData, accountController.registerAccount)
router.post("/login", validate.loginRules(), validate.checkLoginData, accountController.accountLogin)

module.exports = router