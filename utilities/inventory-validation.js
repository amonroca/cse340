const utilities = require(".")
const {body, validationResult} = require("express-validator")
const validate = {}

/* ****************************************
 *  Adding Classification Validation Rules
 * *************************************** */
validate.addClassificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty().withMessage("Classification name is required.")
            .isLength({ min: 3 }).withMessage("Classification name must be at least 3 characters.")
            .matches(/^[A-Za-z]+$/).withMessage("Classification name must contain only letters and no spaces.")
    ]
}

/* ****************************************
 *  Check data and return errors or continue to add classification
 * *************************************** */
validate.checkAddClassificationData = async (req, res, next) => {
    const { classification_name } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            errors: errors.array(),
            title: "Add New Classification",
            nav,
            classification_name
        })
    } else {
        // If no errors, continue to add classification
        next()
    }
}

/* ****************************************
 *  Validate Inventory Data
 * *************************************** */
validate.addInventoryRules = () => {
    return [
        body("inv_make")
            .trim()
            .escape()
            .notEmpty().withMessage("Make is required.")
            .isLength({ min: 2 }).withMessage("Make must be at least 2 characters."),
        body("inv_model")
            .trim()
            .escape()
            .notEmpty().withMessage("Model is required.")
            .isLength({ min: 2 }).withMessage("Model must be at least 2 characters."),
        body("inv_year")
            .isNumeric().withMessage("Year must be a number.")
            .isInt({ min: 1886, max: new Date().getFullYear() }).withMessage(`Year must be between 1886 and ${new Date().getFullYear()}.`),
        body("inv_miles")
            .matches(/^\d+$/).withMessage("Mileage must be a whole number without dots or commas.")
            .custom(value => parseInt(value, 10) >= 0).withMessage("Mileage cannot be negative."),
        body("inv_color")
            .trim()
            .escape()
            .notEmpty().withMessage("Color is required."),
        body("inv_price")
            .isNumeric().withMessage("Price must be a number.")
            .custom(value => value > 0).withMessage("Price must be greater than zero."),
        body("inv_description")
            .trim()
            .escape()
            .notEmpty().withMessage("Description is required."),
        body("inv_image")
            .trim()
            .notEmpty().withMessage("Image is required."),
        body("inv_thumbnail")
            .trim()
            .notEmpty().withMessage("Thumbnail is required."),
        body("classification_id")
            .notEmpty().withMessage("Classification is required.")
    ]   
}

/* ****************************************
 *  Check data and return errors or continue to add inventory
 * *************************************** */
validate.checkAddInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_miles, inv_color, inv_price, inv_description,inv_image, inv_thumbnail, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/add-inventory", {
            errors: errors.array(),
            title: "Add New Inventory",
            nav,
            inv_make,
            inv_model,
            inv_year,
            inv_miles,
            inv_color,
            inv_price,
            inv_description,
            inv_image,
            inv_thumbnail,
            classifications: await utilities.buildClassificationList(classification_id),
        })
    } else {
        // If no errors, continue to add inventory
        next()
    }
}

/* ****************************************
 *  Check data and return errors or continue to update inventory
 * *************************************** */
validate.checkEditInventoryData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model, inv_year, inv_miles, inv_color, inv_price, inv_description,inv_image, inv_thumbnail, classification_id } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("inventory/edit-inventory", {
            errors: errors.array(),
            title: "Edit Inventory",
            nav,
            inv_id,
            inv_make,
            inv_model,
            inv_year,
            inv_miles,
            inv_color,
            inv_price,
            inv_description,
            inv_image,
            inv_thumbnail,
            classifications: await utilities.buildClassificationList(classification_id),
        })
    } else {
        // If no errors, continue to add inventory
        next()
    }
}

module.exports = validate