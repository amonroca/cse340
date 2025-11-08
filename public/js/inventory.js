'use strict'

let classificationList = document.querySelector("#classificationList")
let inventoryDisplay = document.getElementById("inventoryDisplay");
classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value
    let classIdURL = "/inv/getInventory/" + classification_id
    inventoryDisplay.innerHTML = ""
    fetch(classIdURL)
        .then(function (response) {
            if (!response.ok) {
                // If 404 or no inventory, show empty message
                if (response.status === 404) {
                    showEmptyMessage();
                }
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(function (data) {
            if (!data || !data.rows || data.rows.length === 0) {
                showEmptyMessage();
            } else {
                buildInventoryList(data.rows);
            }
        })
        .catch(function (error) {
            console.log("There was a problem with the fetch operation:", error);
        });
});

function buildInventoryList(data) {
    let dataTable = '<thead>';
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>';
    dataTable += '</thead>';
    dataTable += '<tbody>';

    data.forEach(function (item) {
        dataTable += '<tr>';
        dataTable += `<td>${item.inv_make} ${item.inv_model}</td>`;
        dataTable += `<td><a href="/inv/edit/${item.inv_id}" title="Click to update">Modify</a></td>`;
        dataTable += `<td><a href="/inv/delete/${item.inv_id}" title="Click to delete">Delete</a></td>`;
        dataTable += '</tr>';
    });
    dataTable += '</tbody>';

    inventoryDisplay.innerHTML = dataTable;
}

function showEmptyMessage() {
    inventoryDisplay.innerHTML = '<tr><td colspan="3">No vehicles found for this classification.</td></tr>';
}