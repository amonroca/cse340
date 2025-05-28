const express = require("express")
const router = express.Router()
const inventoryController = require("../controllers/inventoryController")

router.get("/type/:classification_id", inventoryController.buildVehicleList)
router.get("/detail/:inv_id", inventoryController.buildVehicleDetail)

module.exports = router