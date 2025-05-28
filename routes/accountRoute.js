const express = require("express")
const router = express.Router()
const accountController = require("../controllers/accountController")

router.get("/login", accountController.buildLogin)
router.get("/register", accountController.buildRegister)
router.post("/register", accountController.registerAccount)

module.exports = router