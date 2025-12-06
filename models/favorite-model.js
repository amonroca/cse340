const pool = require("../database/")

/**
 * Add a vehicle to user's favorites
 */
async function addFavorite(account_id, inv_id) {
  const sql = `
    INSERT INTO public.account_favorites (account_id, inv_id)
    VALUES ($1, $2)
    ON CONFLICT (account_id, inv_id) DO NOTHING
    RETURNING favorite_id
  `
  return await pool.query(sql, [account_id, inv_id])
}

/**
 * Remove a vehicle from user's favorites
 */
async function removeFavorite(account_id, inv_id) {
  const sql = `
    DELETE FROM public.account_favorites
    WHERE account_id = $1 AND inv_id = $2
  `
  return await pool.query(sql, [account_id, inv_id])
}

/**
 * List favorites for an account with vehicle details
 */
async function getFavoritesByAccountId(account_id) {
  const sql = `
    SELECT f.favorite_id, f.created_at,
           i.inv_id, i.inv_make, i.inv_model, i.inv_year,
           i.inv_thumbnail, i.inv_price
    FROM public.account_favorites f
    JOIN public.inventory i ON i.inv_id = f.inv_id
    WHERE f.account_id = $1
    ORDER BY f.created_at DESC
  `
  return await pool.query(sql, [account_id])
}

/**
 * Check if a vehicle is favorited by the account
 */
async function isFavorite(account_id, inv_id) {
  const sql = `
    SELECT 1 FROM public.account_favorites
    WHERE account_id = $1 AND inv_id = $2
    LIMIT 1
  `
  const result = await pool.query(sql, [account_id, inv_id])
  return result && result.rows && result.rows.length > 0
}

module.exports = { addFavorite, removeFavorite, getFavoritesByAccountId, isFavorite,}
