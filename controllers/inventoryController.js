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

        if (!vehicleDetail || vehicleDetail.title === "Vehicle Detail") {
            const err = new Error("Vehicle not found")
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

module.exports = invController