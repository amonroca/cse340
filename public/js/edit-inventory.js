const form = document.querySelector("#updateForm");

form.addEventListener("change", function () {
    const updateButton = document.querySelector("button");
    updateButton.removeAttribute("disabled");
});

form.addEventListener("submit", function () {
    const updateButton = document.querySelector("button");
    updateButton.setAttribute("disabled", "true");
});