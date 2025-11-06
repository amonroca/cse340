const { parse } = require("dotenv")
const utilities = require("../utilities/")
const invModel = require("../models/inventory-model")
const invController = {}

/* ****************************************
*  Deliver vehicle list by classification view
* *************************************** */
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

/* ****************************************
*  Deliver vehicle detail view
* *************************************** */
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

/* ****************************************
 *  Deliver vehicle management view
 * *************************************** */
invController.buildVehicleManagement = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const classificationSelect = await utilities.buildClassificationList()
        res.render("inventory/management", {
            title: "Vehicle Management",
            nav,
            classificationSelect,
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 *  Deliver add classification view
 * *************************************** */
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

/* ****************************************
 *  Process add classification
 * *************************************** */
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

/* ****************************************
 *  Deliver add inventory view
 * *************************************** */
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

/* ****************************************
 *  Process add inventory
 * *************************************** */
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

        if (!result.success) {
            req.flash("error", "Sorry, there was an error adding the vehicle.")
            return res.render("inventory/add-inventory", {
                title: "Add New Inventory",
                nav,
                errors: null,
                classifications: await utilities.buildClassificationList(classification_id),
            })
        } else {
            req.flash("success", "The new vehicle was added successfully.")
            res.render("inventory/management", {
                title: "Vehicle Management",
                nav,
                classificationSelect: await utilities.buildClassificationList(),
                errors: null,
            })
        }
        
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 *  Deliver inventory data as JSON
 * *************************************** */
invController.getInventoryJSON = async function (req, res, next) {
    try {
        const classification_id = parseInt(req.params.classification_id)
        const inventoryData = await invModel.getVehicleListByClassificationId(classification_id)
        if (inventoryData.rows.length > 0) {
            return res.json(inventoryData)
        }
        else {
            next(new Error("No inventory found"))
        }
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 *  Deliver edit inventory view
 * *************************************** */
invController.buildEditInventory = async function (req, res, next) { 
    try {
        const inv_id = parseInt(req.params.inv_id)
        const inventoryData = await invModel.getVehicleById(inv_id)
        if (inventoryData) {
            const nav = await utilities.getNav()
            // Build classification select with current vehicle classification pre-selected
            const currentClassificationId = inventoryData.rows[0].classification_id
            const classifications = await utilities.buildClassificationList(currentClassificationId)
            const itemName = `${inventoryData.rows[0].inv_make} ${inventoryData.rows[0].inv_model}`
            res.render("inventory/edit-inventory", {
                title: `Edit ${itemName}`,
                nav,
                errors: null,
                inv_id: inventoryData.rows[0].inv_id,
                inv_make: inventoryData.rows[0].inv_make,
                inv_model: inventoryData.rows[0].inv_model,
                inv_year: inventoryData.rows[0].inv_year,
                inv_miles: inventoryData.rows[0].inv_miles,
                inv_color: inventoryData.rows[0].inv_color,
                inv_price: inventoryData.rows[0].inv_price,
                inv_description: inventoryData.rows[0].inv_description,
                inv_image: inventoryData.rows[0].inv_image,
                inv_thumbnail: inventoryData.rows[0].inv_thumbnail,
                // Keep original field for backward compatibility
                inv_classification: currentClassificationId,
                // Also expose the id via locals to support views that check locals.inv_classification_id
                inv_classification_id: currentClassificationId,
                classifications
            })
        } else {
            next(new Error("No inventory found"))
        }
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 *  Process edit inventory
 * *************************************** */
invController.updateInventory = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const {
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
            classification_id
        } = req.body

        const result = await utilities.updateInventory({
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
            classification_id
        })

        const itemName = `${inv_make} ${inv_model}`

        if (!result.success) {
            req.flash("error", "Sorry, there was an error updating the vehicle.")
            return res.status(501).render("inventory/edit-inventory", {
                title: "Edit " + itemName,
                nav,
                errors: null,
                classifications: await utilities.buildClassificationList(classification_id),
                inv_id,
                inv_make: inv_make,
                inv_model: inv_model,
                inv_year: inv_year,
                inv_miles: inv_miles,
                inv_color: inv_color,
                inv_price: inv_price,
                inv_description: inv_description,
                inv_image: inv_image,
                inv_thumbnail: inv_thumbnail,
            })
        } else {
            req.flash("success", `The vehicle ${itemName} was updated successfully.`)
            res.render("inventory/management", {
                title: "Vehicle Management",
                nav,
                classificationSelect: await utilities.buildClassificationList(),
                errors: null,
            })
        }

    } catch (error) {
        next(error)
    }
}

module.exports = invController