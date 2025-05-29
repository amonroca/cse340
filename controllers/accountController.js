const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")

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

module.exports = { buildLogin, buildRegister, registerAccount, fakeLogin }