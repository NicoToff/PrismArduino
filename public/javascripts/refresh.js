const toggleButton = document.getElementById("toggle-button");
toggleButton.setAttribute("disabled", true);
const toggleForm = document.querySelector("#toggle-form");
const logger = document.querySelector("#logger");
let buffer = "";
let activity = { recording: false };
// TODO set this to current server value
// console.log("Activity:" + activity.recording);

$.ajax({
    type: "post",
    url: "/",
    dataType: "json",
    success: function (response) {
        activity.recording = response.serverRecording;
        console.log("Client: " + activity.recording);
        console.log("Response: " + response.serverRecording);
        if (activity.recording) {
            $("#enregistrement").text("En cours...");
            changeButton(toggleButton, "red", "Arrêter");
        }
        main();
    },
});

function main() {
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
                // ... réactive le bouton.
                toggleButton.removeAttribute("disabled");

                if (activity.recording && response?.dbRecord != null) {
                    const date = new Date(response.dbRecord?.horodatage);
                    buffer += `${humanReadableDate(date)} => ${response?.dbRecord?.mesure}\n`;
                    logger.textContent = buffer;
                    logger.scrollTop = logger.scrollHeight;
                }
            },
        });
    }, 1000);

    $("#toggle-button").click(function () {
        toggleButton.setAttribute("disabled", true);
        activity.recording = !activity.recording;
        $.post("/api/toggle", activity);
        if (activity.recording) {
            $("#enregistrement").text("En cours...");
            changeButton(toggleButton, "red", "Arrêter");
        } else {
            $("#enregistrement").text("Arrêt");
            changeButton(toggleButton, "green", "Démarrer");
        }
    });
}

/**
 * Given a Date, returns a string with a "YYYY/MM/DD HH:mm:ss" format.
 * @param {Date} date
 * @returns A string in a format like so: "2022/4/26 12:54:56"
 */
// prettier-ignore
function humanReadableDate(date) {
    if (date == null) return "";
    return `${date?.getFullYear()}/${date?.getMonth() + 1}/${date?.getDate()} ${
            Number(date?.getHours())   < 10 ? "0" + date?.getHours()   : date?.getHours()}:${
            Number(date?.getMinutes()) < 10 ? "0" + date?.getMinutes() : date?.getMinutes()}:${
            Number(date?.getSeconds()) < 10 ? "0" + date?.getSeconds() : date?.getSeconds()}`;
}
/**
 * Changes the aspect of a button
 * @param {HTMLButtonElement} button A button object
 * @param {string} color Valid = "red" or "green"
 * @param {string} text The new text for the button (defaults to "OK")
 */
function changeButton(button, color, text = "OK") {
    if (color === "green") {
        button.innerText = text;
        button.classList.remove("btn-danger");
        button.classList.add("btn-success");
    } else if (color === "red") {
        button.innerText = text;
        button.classList.remove("btn-success");
        button.classList.add("btn-danger");
    } else {
        button.innerText = text;
        button.classList.add("btn-primary");
        button.classList.remove("btn-success");
        button.classList.remove("btn-danger");
    }
}
