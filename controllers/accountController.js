const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res, next) {
    try {
        let nav = await utilities.getNav()
        res.render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res, next) {
    try {
        // Check if the user is already logged in
        if (req.session.account) {
            req.flash("notice", "You are already logged in.")
            return res.redirect("/")
        }

        let nav = await utilities.getNav()
        const { account_firstname, account_lastname, account_email, account_password } = req.body

        let hashedPassword
        try {
            hashedPassword = await bcrypt.hash(account_password, 10)
        } catch (error) {
            req.flash("error", "Sorry, there was an error processing your registration. Please try again.")
            return res.render("account/register", {
                title: "Registration",
                nav,
                errors: null,
            })
        }

        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            hashedPassword
        )

        if (regResult) {
            req.flash(
            "success",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
            )
            res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            })
        } else {
            req.flash("error", "Sorry, the registration failed.")
            res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Fake login for testing purposes
* *************************************** */
async function fakeLogin(req, res, next) {
    try {
        let nav = await utilities.getNav()
        const { account_email, account_password } = req.body

        let errors = []
        if (!account_email || !account_email.includes("@")) {
            errors.push({ msg: "Please enter a valid email address." })
        }
        if (!account_password || account_password.length < 12) {
            errors.push({ msg: "Password must be at least 12 characters." })
        }

        if (errors.length > 0) {
            req.flash("error", errors.map(e => e.msg).join(" "))
            return res.render("account/login", {
                title: "Login",
                nav,
                errors
            })
        }

        req.flash("success", "Login successful (fake)!")
        res.render("account/login", {
            title: "Login",
            nav,
            errors: null
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Process Account Login
* *************************************** */
async function accountLogin(req, res, next) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("error", "No account found with that email.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password // Remove password from session data
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            if (process.env.NODE_ENV === "development") {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    secure: false, // Set to true in production
                    maxAge: 3600000 // 1 hour
                })
            } else {
                res.cookie("jwt", accessToken, {
                    httpOnly: true,
                    secure: true, // Set to true in production
                    maxAge: 3600000 // 1 hour
                })
            }
            return res.redirect("/account/")
        } else {
            req.flash("error", "Incorrect password.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        next(error)
    }
}

module.exports = { buildLogin, buildRegister, registerAccount, fakeLogin, accountLogin }