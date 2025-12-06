const { parse } = require("dotenv")
const utilities = require("../utilities/")
const invModel = require("../models/inventory-model")
const favoriteModel = require("../models/favorite-model")
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
        const inv_id = parseInt(req.params.inv_id)
        const nav = await utilities.getNav()
        const vehicleDetail = await utilities.getVehicleDetail(inv_id)

        if (!vehicleDetail || vehicleDetail.html === "Vehicle not found.") {
            const err = new Error("Vehicle not found.")
            err.status = 404
            return next(err)
        }
        // Determine if this vehicle is in user's favorites
        let isFavorite = false
        if (res.locals && res.locals.loggedin) {
            try {
                const account_id = res.locals.accountData.account_id
                isFavorite = await favoriteModel.isFavorite(account_id, inv_id)
            } catch (e) {
                // Non-fatal: leave isFavorite = false
            }
        }
        res.render("inventory/detail", {
            title: vehicleDetail.title,
            nav,
            vehicleDetail: vehicleDetail.html,
            inv_id,
            isFavorite,
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
            return res.redirect("/inv/management")
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
            return res.status(404).json({ error: "No inventory found" })
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
        const inventoryData = await utilities.getVehicleById(inv_id)
        if (inventoryData) {
            const nav = await utilities.getNav()
            // Build classification select with current vehicle classification pre-selected
            const currentClassificationId = inventoryData.classification_id
            const classifications = await utilities.buildClassificationList(currentClassificationId)
            const itemName = `${inventoryData.inv_make} ${inventoryData.inv_model}`
            res.render("inventory/edit-inventory", {
                title: `Edit ${itemName}`,
                nav,
                errors: null,
                inv_id: inventoryData.inv_id,
                inv_make: inventoryData.inv_make,
                inv_model: inventoryData.inv_model,
                inv_year: inventoryData.inv_year,
                inv_miles: inventoryData.inv_miles,
                inv_color: inventoryData.inv_color,
                inv_price: inventoryData.inv_price,
                inv_description: inventoryData.inv_description,
                inv_image: inventoryData.inv_image,
                inv_thumbnail: inventoryData.inv_thumbnail,
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
            res.redirect("/inv/management")
        }

    } catch (error) {
        next(error)
    }
}

/* ****************************************
 *  Process delete inventory
 * *************************************** */
invController.deleteInventory = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const inv_id = parseInt(req.body.inv_id)
        const itemName = req.body.itemName

        const result = await utilities.deleteInventory(inv_id)

        if (!result.success) {
            req.flash("error", "Sorry, there was an error deleting the vehicle.")
            return res.status(501).render("inventory/delete-inventory", {
                title: "Delete " + itemName,
                nav,
                errors: null,
                classificationSelect: await utilities.buildClassificationList(),
            })
        } else {
            req.flash("success", `The vehicle ${itemName} was deleted successfully.`)
            res.redirect("/inv/management")
        }

    } catch (error) {
        next(error)
    }
}

/* ****************************************
 *  Deliver delete inventory view
 * *************************************** */
invController.buildDeleteInventory = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const inv_id = parseInt(req.params.inv_id)
        const vehicle = await utilities.getVehicleById(inv_id)
        console.log(vehicle)

        if (vehicle === "Vehicle not found.") {
            req.flash("error", vehicle)
            return res.redirect("/inv/management")
        } else {
            res.render("inventory/delete-confirm", {
                title: `Delete ${vehicle.inv_make} ${vehicle.inv_model}`,
                nav,
                inv_id: vehicle.inv_id,
                inv_make: vehicle.inv_make,
                inv_model: vehicle.inv_model,
                inv_year: vehicle.inv_year,
                inv_price: vehicle.inv_price,
                errors: null,
            })
        }

    } catch (error) {
        next(error)
    }
}

module.exports = invController