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
            req.flash("success", "You are logged in.")
            // Populate res.locals for header.ejs
            res.locals.loggedin = 1
            res.locals.accountData = accountData
            return res.render("account/management", {
                title: "Account Management",
                nav,
                welcomeMessage: `Welcome back, ${accountData.account_firstname}!`,
                accountType: accountData.account_type,
                errors: null,
            })
        } else {
            req.flash("error", "Please check your password and try again.")
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

/* ****************************************
*  Build Account Management View
* *************************************** */
async function buildAccountManagement(req, res, next) {
    const accountData = res.locals.accountData
    try {
        let nav = await utilities.getNav()
        res.render("account/management", {
            title: "Account Management",
            nav,
            welcomeMessage: `Welcome back, ${accountData.account_firstname}!`,
            accountType: accountData.account_type,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Process Logout
* *************************************** */
async function logout(req, res, next) {
    try {
        // Mensagem de sucesso
        req.flash("success", "You have been logged out.")
        // Limpa cookie do JWT
        res.clearCookie("jwt")
        // Redireciona para home (PRG)
        return res.redirect("/")
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Deliver Account Update View
* *************************************** */
async function buildAccountUpdate(req, res, next) {
    try {
        const nav = await utilities.getNav()
        // Prefer data from JWT
        const account_id = res.locals?.accountData?.account_id || req.query.account_id
        let acct = null
        if (account_id) {
            acct = await accountModel.getAccountById(account_id)
        }
        return res.render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
            account_id: acct?.account_id,
            account_firstname: acct?.account_firstname,
            account_lastname: acct?.account_lastname,
            account_email: acct?.account_email
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Process Account Info Update
* *************************************** */
async function processAccountUpdate(req, res, next) {
    try {
        const nav = await utilities.getNav()
        const { account_id, account_firstname, account_lastname, account_email } = req.body
        // Update DB
        const result = await accountModel.updateAccountInfo(account_id, account_firstname, account_lastname, account_email)
        if (!result || result.rowCount !== 1) {
            req.flash("error", "Account update failed. Please try again.")
            return res.redirect("/account/update") // PRG pattern on failure
        }
        // Success: fetch updated data, issue fresh JWT (invalidate old token) and redirect (PRG)
        const updated = await accountModel.getAccountById(account_id)
        if (updated) {
            // Remove password hash before embedding in JWT
            const { account_password, ...safePayload } = updated
            const newToken = jwt.sign(safePayload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            if (process.env.NODE_ENV === "development") {
                res.cookie("jwt", newToken, { httpOnly: true, secure: false, maxAge: 3600000 })
            } else {
                res.cookie("jwt", newToken, { httpOnly: true, secure: true, maxAge: 3600000 })
            }
        }
        req.flash("success", "Account updated successfully.")
        return res.redirect("/account")
    } catch (error) {
        next(error)
    }
}

/* ****************************************
*  Process Password Update
* *************************************** */
async function processPasswordUpdate(req, res, next) {
    try {
        const { account_id, account_password } = req.body
        // Hash new password
        const hashed = await bcrypt.hash(account_password, 10)
        const result = await accountModel.updateAccountPassword(account_id, hashed)
        if (!result || result.rowCount !== 1) {
            req.flash("error", "Password update failed. Please try again.")
            return res.redirect("/account/update") // PRG pattern on failure
        }
        // Invalidate old token: clear cookie and force re-login for security
        res.clearCookie("jwt")
        req.flash("success", "Password updated successfully. Please log in again.")
        return res.redirect("/account/login")
    } catch (error) {
        next(error)
    }
}

module.exports = { buildLogin, buildRegister, registerAccount, fakeLogin, accountLogin, buildAccountManagement, logout, buildAccountUpdate, processAccountUpdate, processPasswordUpdate }