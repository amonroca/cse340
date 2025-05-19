-- TASK 1: Insert a new account with the following details:
-- First Name: Tony
-- Last Name: Stark
-- Email: tony@starkent.com
-- Password: Iam1ronM@n
INSERT INTO account (
        account_firstname,
        account_lastname,
        account_email,
        account_password
    )
VALUES (
        'Tony',
        'Stark',
        'tony@starkent.com',
        'Iam1ronM@n'
    );
-- TASK 2: Update the account_type of account with ID 1 from 'Client' to 'Admin'
UPDATE account
SET account_type = 'Admin'
WHERE account_id = 1;
-- Taskk 3: Delete the account with ID 1
DELETE FROM account
WHERE account_id = 1;
-- Task 4: Update the inv_description of the inventory item with ID 10 from 'small interiors' to 'a huge interior'
UPDATE inventory
SET inv_description = REPLACE(
        inv_description,
        'small interiors',
        'a huge interior'
    )
WHERE inv_id = 10;
-- Task 5: Select the inv_make, inv_model, and classification_name of all inventory items that belong to the 'Sport' classification
SELECT i.inv_make,
    i.inv_model,
    c.classification_name
FROM inventory i
    INNER JOIN classification c ON i.classification_id = c.classification_id
WHERE c.classification_id = 2;
-- Task 6: Update the inv_image and inv_thumbnail of all inventory items to include the path '/images/vehicles/' before the image name
-- For example, if the current inv_image is 'car.jpg', it should be updated to '/images/vehicles/car.jpg'
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');