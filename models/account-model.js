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

/* ****************************************
*  Return account by id
* *************************************** */
async function getAccountById(account_id) {
    try {
        const sql = "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM public.account WHERE account_id = $1"
        const result = await pool.query(sql, [account_id])
        return result.rows[0]
    } catch (error) {
        return error.message
    }
}

/* ****************************************
*  Update account basic info (firstname, lastname, email)
* *************************************** */
async function updateAccountInfo(account_id, account_firstname, account_lastname, account_email) {
    try {
        const sql = "UPDATE public.account SET account_firstname = $2, account_lastname = $3, account_email = $4 WHERE account_id = $1 RETURNING account_id"
        const result = await pool.query(sql, [account_id, account_firstname, account_lastname, account_email])
        return result
    } catch (error) {
        return error.message
    }
}

/* ****************************************
*  Update account password (hashed)
* *************************************** */
async function updateAccountPassword(account_id, hashedPassword) {
    try {
        const sql = "UPDATE public.account SET account_password = $2 WHERE account_id = $1 RETURNING account_id"
        const result = await pool.query(sql, [account_id, hashedPassword])
        return result
    } catch (error) {
        return error.message
    }
}

module.exports = { registerAccount, emailExists, getAccountByEmail, getAccountById, updateAccountInfo, updateAccountPassword }