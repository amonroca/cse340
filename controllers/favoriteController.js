const utilities = require("../utilities/")
const favoriteModel = require("../models/favorite-model")
const { validationResult } = require("express-validator")

const favoriteController = {}

/* ****************************************
 *  Deliver Favorites view
 * *************************************** */
favoriteController.buildFavorites = async function (req, res, next) {
  try {
	const nav = await utilities.getNav()
	const account_id = res.locals.accountData.account_id
	const favoriteList = await utilities.getFavoriteList(account_id)
	res.render("account/favorites", {
		title: "My Favorites",
		nav,
		favorites: favoriteList,
		errors: null,
	})
  } catch (error) {
    	next(error)
  }
}

/* ****************************************
 *  Add favorite (POST)
 * *************************************** */
favoriteController.addFavorite = async function (req, res, next) {
  try {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		req.flash("error", "Invalid request.")
		return res.redirect("back")
	} else {
		const account_id = res.locals.accountData.account_id
		const inv_id = parseInt(req.body.inv_id)
		await favoriteModel.addFavorite(account_id, inv_id)
		req.flash("success", "Added to favorites.")
		return res.redirect(`/inv/detail/${inv_id}`)
	}
  } catch (error) {
    	next(error)
  }
}

/* ****************************************
 *  Remove favorite (POST)
 * *************************************** */
favoriteController.removeFavorite = async function (req, res, next) {
  try {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		req.flash("error", "Invalid request.")
		return res.redirect("back")
	} else {
		const account_id = res.locals.accountData.account_id
		const inv_id = parseInt(req.body.inv_id)
		await favoriteModel.removeFavorite(account_id, inv_id)
		req.flash("success", "Removed from favorites.")
		return res.redirect(req.body.redirectTo)
	}
  } catch (error) {
    	next(error)
  }
}

module.exports = favoriteController
