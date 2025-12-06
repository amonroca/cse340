const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const utilities = require("../utilities/")
const favoriteController = require("../controllers/favoriteController")

// Require login for all favorites routes
router.use(utilities.checkLogin)

// GET favorites list
router.get("/", favoriteController.buildFavorites)

// POST add favorite
router.post(
  "/add",
  body("inv_id").isInt({ min: 1 }).withMessage("Invalid vehicle."),
  favoriteController.addFavorite
)

// POST remove favorite
router.post(
  "/remove",
  body("inv_id").isInt({ min: 1 }).withMessage("Invalid vehicle."),
  favoriteController.removeFavorite
)

module.exports = router
