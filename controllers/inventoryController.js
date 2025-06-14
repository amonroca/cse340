const utilities = require("../utilities/")
const invController = {}

invController.buildVehicleList = async function (req, res, next) {
    try {
        const classification_id = req.params.classification_id
        const nav = await utilities.getNav()
        const classification = await utilities.getClassification(classification_id)
        if (!classification || classification === "Classification not found.") {
            const err = new Error("Classification not found.")
            err.status = 404
            return next(err)
        }
        const vehicleList = await utilities.getVehicleList(classification_id)
        if (!vehicleList || vehicleList === "No vehicles found for this classification.") {
            const err = new Error("No vehicles found for this classification.")
            err.status = 404
            return next(err)
        }
        res.render("inventory/classification", {
            title: classification,
            nav,
            vehicleList,
        })
    } catch (error) {
        next(error)
    }
}

invController.buildVehicleDetail = async function (req, res, next) {
    try {
        const inv_id = req.params.inv_id
        const nav = await utilities.getNav()
        const vehicleDetail = await utilities.getVehicleDetail(inv_id)

        if (!vehicleDetail || vehicleDetail.html === "Vehicle not found.") {
            const err = new Error("Vehicle not found.")
            err.status = 404
            return next(err)
        }

        res.render("inventory/detail", {
            title: vehicleDetail.title,
            nav,
            vehicleDetail: vehicleDetail.html,
        })
    } catch (error) {
        next(error)
    }
}

invController.buildVehicleManagement = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()

        res.render("inventory/management", {
            title: "Vehicle Management",
            nav,
        })
    } catch (error) {
        next(error)
    }
}

invController.buildAddClassification = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()

        res.render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

invController.addClassification = async function (req, res, next) {
    try {
        let nav = await utilities.getNav()
        const classification_name = req.body.classification_name
        if (!classification_name) {
            req.flash("error", "Classification name is required.")
            return res.render("inventory/add-classification", {
                title: "Add New Classification",
                nav,
                errors: null,
            })
        }

        const result = await utilities.addClassification(classification_name)
        if (result.error) {
            req.flash("error", result.error)
            return res.render("inventory/add-classification", {
                title: "Add New Classification",
                nav,
                errors: null,
            })
        }

        req.flash("success", "Classification added successfully.")
        res.render("inventory/management", {
            title: "Add New Classification",
            nav: await utilities.getNav(),
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

invController.buildAddInventory = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const classifications = await utilities.buildClassificationList()

        res.render("inventory/add-inventory", {
            title: "Add New Inventory",
            nav,
            errors: null,
            classifications,
        })
    } catch (error) {
        next(error)
    }
}

invController.addInventory = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const {
            inv_make,
            inv_model,
            inv_year,
            inv_miles,
            inv_color,
            inv_price,
            inv_description,
            inv_image,
            inv_thumbnail,
            classification_id
        } = req.body

        const result = await utilities.addInventory({
            inv_make,
            inv_model,
            inv_year,
            inv_miles,
            inv_color,
            inv_price,
            inv_description,
            inv_image,
            inv_thumbnail,
            classification_id
        })

        if (result.error) {
            req.flash("error", result.error)
            return res.render("inventory/add-inventory", {
                title: "Add New Inventory",
                nav,
                errors: null,
                classifications: await utilities.buildClassificationList(classification_id),
            })
        }

        req.flash("success", "The new vehicle was added successfully.")
        res.render("inventory/management", {
            title: "Vehicle Management",
            nav,
            errors: null,
        })
    } catch (error) {
        next(error)
    }
}

module.exports = invController