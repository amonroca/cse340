const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

async function getClassificationById(classification_id){
    return await pool.query("SELECT * FROM public.classification WHERE classification_id = $1", [classification_id])
} 

async function getVehicleListByClassificationId(classification_id) {
    return await pool.query("SELECT * FROM public.inventory WHERE classification_id = $1", [classification_id])
}

async function getVehicleById(inv_id) {
    return await pool.query("SELECT * FROM public.inventory WHERE inv_id = $1", [inv_id])
}

module.exports = {getClassifications, getVehicleListByClassificationId, getVehicleById, getClassificationById}