const utilities = require(".")
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
            .normalizeEmail(),
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
            account_email
        })
        return
    }
    next()
}

module.exports = validate