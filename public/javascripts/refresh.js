const toggleButton = document.getElementById("toggle-button");
const toggleForm = document.querySelector("#toggle-form");
const logger = document.querySelector("#logger");
let buffer = "";

// setInterval() se lance toutes les xxx millisecondes
setInterval(() => {
    // Demander au serveur...
    $.ajax({
        type: "post",
        url: "/api/fetch",
        dataType: "json",
        success: function (response) {
            // ... la dernière mesure prise et l'affiche ...
            $("#mesure-lue").text(response.mesure);
            // ... adapte l'état du bouton ...
            if (response.enregistrement === true) {
                $("#enregistrement").text("En cours...");
                toggleButton.innerText = "Arrêter";
                toggleButton.classList.remove("btn-success");
                toggleButton.classList.add("btn-danger");
                if (response?.dbRecord != null) {
                    const date = new Date(response?.dbRecord?.horodatage);
                    buffer += `${humanReadableDate(date)} => ${response?.dbRecord?.mesure}\n`;
                    logger.textContent = buffer;
                    logger.scrollTop = logger.scrollHeight;
                }
            } else {
                $("#enregistrement").text("Arrêt");
                toggleButton.innerText = "Démarrer";
                toggleButton.classList.remove("btn-danger");
                toggleButton.classList.add("btn-success");
            }
        },
    });
}, 1000);

// toggleForm.addEventListener("submit", e => {
//     e.preventDefault();
// });

/**
 * Given a Date, returns a string with a "YYYY/MM/DD HH:mm:ss" format.
 * @param {Date} date
 * @returns A string in a format like so: "2022/4/26 12:54:56"
 */
function humanReadableDate(date) {
    if (date == null) return "";
    return `${date?.getFullYear()}/${
        date?.getMonth() + 1
    }/${date?.getDate()} ${date?.getHours()}:${date?.getMinutes()}:${
        Number(date?.getSeconds()) < 10 ? "0" + date?.getSeconds() : date?.getSeconds()
    }`;
}
