const e = require("connect-flash")
const pool = require("../database/")

/* *****************************
*   Register new account
* *************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password){
    try {
        const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
        return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
    } catch (error) {
        return error.message
    }
}

/* ****************************************
*  Check if email already exists
* *************************************** */
async function emailExists(account_email) {
    try {
        const sql = "SELECT * FROM public.account WHERE account_email = $1"
        const result = await pool.query(sql, [account_email])
        return result.rowCount
    } catch (error) {
        return error.message
    }
}

/* ****************************************
*  Return account by email
* *************************************** */
async function getAccountByEmail(account_email) {
    try {
        const sql = "SELECT account_id, account_firstname, account_lastname, account_type, account_password FROM public.account WHERE account_email = $1"
        const result = await pool.query(sql, [account_email])
        return result.rows[0]
    } catch (error) {
        return error.message
    }
}

module.exports = { registerAccount, emailExists, getAccountByEmail }