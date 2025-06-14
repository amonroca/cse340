const express = require("express")
const router = express.Router()
const inventoryController = require("../controllers/inventoryController")
const validate = require("../utilities/inventory-validation")

router.get("/type/:classification_id", inventoryController.buildVehicleList)
router.get("/detail/:inv_id", inventoryController.buildVehicleDetail)
router.get("/management", inventoryController.buildVehicleManagement)
router.get("/add-classification", inventoryController.buildAddClassification)
router.post("/add-classification", validate.addClassificationRules(), validate.checkAddClassificationData, inventoryController.addClassification)
router.get("/add-inventory", inventoryController.buildAddInventory)
router.post("/add-inventory", validate.addInventoryRules(), validate.checkAddInventoryData, inventoryController.addInventory)

module.exports = router