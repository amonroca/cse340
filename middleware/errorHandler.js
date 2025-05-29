const utilities = require("../utilities/")

async function errorHandler(err, req, res, next) {
    let nav = await utilities.getNav()
    console.error(`Error at: "${req.originalUrl}": ${err.message}`)
    res.render("errors/error", {
        title: err.status || 'Server Error',
        message: err.message,
        nav
    })
}

// This middleware function handles errors in the application.
// It logs the error and renders an error page with the appropriate status and message.
module.exports = errorHandler