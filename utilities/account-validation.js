const utilities = require(".")
const accountModel = require("../models/account-model")
const {body, validationResult} = require("express-validator")
const validate = {}

/* ****************************************
 *  Registration Data Validation Rules
 * *************************************** */
validate.registrationRules = () => {
    return [
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty().withMessage("First name is required.")
            .isLength({ min: 1 }).withMessage("First name must be at least 1 character."),
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty().withMessage("Last name is required.")
            .isLength({ min: 2 }).withMessage("Last name must be at least 2 characters."),
        body("account_email")
            .trim()
            .escape()
            .notEmpty().withMessage("Email address is required.")
            .isEmail().withMessage("Please enter a valid email address.")
            .normalizeEmail()
            .custom(async (account_email) => {
                const emailExists = await accountModel.emailExists(account_email)
                if (emailExists) {
                    throw new Error("Email address already exists. Please log in or use a different email address.")
                }
            }),
        body("account_password")
            .trim()
            .notEmpty().withMessage("Password is required.")
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }).withMessage("Password must be at least 12 characters and include at least 1 uppercase letter, 1 number, and 1 special character.")
    ]
}

/* ****************************************
 *  Check data and return erros or continue to registration
 * *************************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/register", {
            errors: errors.array(),
            title: "Registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ****************************************
 *  Login Data Validation Rules
 * *************************************** */
validate.loginRules = () => {
    return [
        body("account_email")
            .trim()
            .escape()
            .notEmpty().withMessage("Email address is required.")
            .isEmail().withMessage("Please enter a valid email address.")
            .normalizeEmail()
            .custom(async (account_email) => {
                const emailExists = await accountModel.emailExists(account_email)
                if (!emailExists) {
                    throw new Error("Email address does not exist. Please register or use a different email address.")
                }
            }),
        body("account_password")
            .trim()
            .notEmpty().withMessage("Password is required.")
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }).withMessage("Password must be at least 12 characters and include at least 1 uppercase letter, 1 number, and 1 special character.")
    ]
}

/* ****************************************
 *  Check data and return errors or continue to login
 * *************************************** */
validate.checkLoginData = async (req, res, next) => {
    const { account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/login", {
            errors: errors.array(),
            title: "Login",
            nav,
            account_email,
        })
        return
    }
    next()
}

/* ****************************************
 *  Edit Account Data Validation Rules
 * *************************************** */

validate.editAccountRules = () => {
    return [
        body("account_firstname")
            .trim()
            .escape()
            .notEmpty().withMessage("First name is required."),
        body("account_lastname")
            .trim()
            .escape()
            .notEmpty().withMessage("Last name is required."),
        body("account_email")
            .trim()
            .escape()
            .notEmpty().withMessage("Email address is required.")
            .isEmail().withMessage("Please enter a valid email address.")
            .normalizeEmail()
            .custom(async (account_email, { req }) => {
                // Only check uniqueness if the email changed
                const existing = await accountModel.getAccountById(req.body.account_id)
                if (!existing) throw new Error("Account not found.")
                if (existing.account_email !== account_email) {
                    const emailInUse = await accountModel.emailExists(account_email)
                    if (emailInUse) {
                        throw new Error("Email address already exists. Please log in or use a different email address.")
                    }
                }
            })
    ]
}

/* ****************************************
 *  Check data and return errors or continue to edit
 * *************************************** */
validate.checkEditAccountData = async (req, res, next) => {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/update", {
            errors: errors.array(),
            title: "Update Account",
            nav,
            account_id,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }
    next()
}

/* ****************************************
 *  Password Update Validation Rules
 * *************************************** */
validate.updatePasswordRules = () => {
    return [
        body("account_password")
            .trim()
            .notEmpty().withMessage("Password is required.")
            .isStrongPassword({
                minLength: 12,
                minLowercase: 1,
                minUppercase: 1,
                minNumbers: 1,
                minSymbols: 1
            }).withMessage("Password must be at least 12 characters and include at least 1 uppercase letter, 1 number, and 1 special character.")
    ]
}

validate.checkUpdatePasswordData = async (req, res, next) => {
    const { account_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        // Keep fields sticky for account basic info
        const acct = await accountModel.getAccountById(account_id)
        return res.render("account/update", {
            errors: errors.array(),
            title: "Update Account",
            nav,
            account_id,
            account_firstname: acct?.account_firstname,
            account_lastname: acct?.account_lastname,
            account_email: acct?.account_email
        })
    }
    next()
}

module.exports = validate