const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
	let data = await invModel.getClassifications()
	let list = "<ul>"
	list += '<li><a href="/" title="Home page">Home</a></li>'
	data.rows.forEach((row) => {
	list += "<li>"
	list +=
		'<a href="/inv/type/' +
		row.classification_id +
		'" title="See our inventory of ' +
		row.classification_name +
		' vehicles">' +
		row.classification_name +
		"</a>"
		list += "</li>"
	})
	list += "</ul>"
	return list
}

Util.getVehicleList = async function (classification_id) {
	let data = await invModel.getVehicleListByClassificationId(classification_id)
	// Check if there are no vehicles in the classification
	if (!data.rows.length) {
		return "No vehicles found for this classification."
	} else {
		let cards = '<div class="vehicle-cards">'
		data.rows.forEach((row) => {
		cards += `
		<div class="vehicle-card">
			<img src="${row.inv_thumbnail}" alt="Thumbnail of ${row.inv_make} ${row.inv_model}" class="vehicle-thumb"/>
			<div class="vehicle-info">
			<h2>${row.inv_make} ${row.inv_model}</h2>
			<p>${row.inv_year}</p>
			<a href="/inv/detail/${row.inv_id}" title="See details for ${row.inv_make} ${row.inv_model}">View Details</a>
			</div>
		</div>
		`
		})
		cards += '</div>'
		return cards
	}
}

Util.getVehicleDetail = async function (inv_id) {
	let data = await invModel.getVehicleById(inv_id)
	// Check if the vehicle exists
	// If not, return a message indicating the vehicle was not found
	if (!data.rows.length) {
		return { html: "Vehicle not found.", title: "Vehicle Detail" }
	} else {
		const row = data.rows[0]

		// Format price and mileage
		const price = Number(row.inv_price).toLocaleString("en-US", { style: "currency", currency: "USD" })
		const mileage = Number(row.inv_miles).toLocaleString("en-US")

		// Compose the title
		const title = `${row.inv_year} ${row.inv_make} ${row.inv_model}`

		// HTML for responsive vehicle detail
		let detail = `
		<div class="vehicle-detail-container">
			<div class="vehicle-detail-image">
			<img src="${row.inv_image}" alt="Image of ${row.inv_make} ${row.inv_model}" />
			</div>
			<div class="vehicle-detail-info">
			<h2>${row.inv_make} ${row.inv_model} Details</h2>
			<p><strong>Price: ${price}</strong></p>
			<p><strong>Description:</strong> ${row.inv_description}</p>
			<p><strong>Color:</strong> ${row.inv_color}</p>
			<p><strong>Miles:</strong> ${mileage} miles</p>
			</div>
		</div>
		`
		return { html: detail, title: title }
	}
}

Util.getClassification = async function (classification_id) {
	let data = await invModel.getClassificationById(classification_id)
	// Check if the classification exists
	if (!data.rows.length) {
		return "Classification not found."
	} else {
		// Return the classification name
		return data.rows[0].classification_name
	}
}

Util.addClassification = async function (classification_name) {
	let data = await invModel.setClassification(classification_name)
	// Check if the classification was added successfully
	if (data.rows.length) {
		return { success: true, classification_id: data.rows[0].classification_id }
	} else {
		return { success: false, message: "Failed to add classification." }
	}
}

Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
    	'<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
    	classificationList += '<option value="' + row.classification_id + '"'
    	if (
    		classification_id != null &&
        	row.classification_id == classification_id
      	) {
        	classificationList += " selected "
      	}
      	classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
}

Util.addInventory = async function (inventoryData) {
	let {
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
	} = inventoryData

	let data = await invModel.setInventory(
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
	)

	if (data.rows.length) {
		return { success: true, inv_id: data.rows[0].inv_id }
	} else {
		return { success: false, message: "Failed to add inventory." }
	}
}

module.exports = Util