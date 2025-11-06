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
router.get("/getInventory/:classification_id", inventoryController.getInventoryJSON)
router.get("/edit/:inv_id", inventoryController.buildEditInventory)
router.post("/edit-inventory", validate.addInventoryRules(), validate.checkEditInventoryData, inventoryController.updateInventory)
//router.post("/delete-inventory", inventoryController.deleteInventory)

module.exports = router