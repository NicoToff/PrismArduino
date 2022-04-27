const toggleButton = document.getElementById("toggle-button");
toggleButton.setAttribute("disabled", true);
const toggleForm = document.querySelector("#toggle-form");
const logger = document.querySelector("#logger");
const mesureLue = document.getElementById("mesure-lue");
const txtEnregistrement = document.getElementById("enregistrement");

let buffer = "";
let activity = { recording: false };

let serverRequest;
serverRequest = new XMLHttpRequest();
serverRequest.onreadystatechange = () => {
    if (serverRequest.readyState === 4) {
        try {
            let response = JSON.parse(serverRequest.response);
            activity.recording = response.serverRecording;
            if (activity.recording) {
                txtEnregistrement.textContent = "En cours...";
                /* In jQuery */
                // $("#enregistrement").text("En cours...");
                changeButton(toggleButton, "red", "Arrêter");
            }
            main();
        } catch (error) {
            location.reload();
        }
    }
};
serverRequest.open("POST", "/", true);
serverRequest.setRequestHeader("Content-type", "application/json");
serverRequest.send();

// $.ajax({
//     type: "post",
//     url: "/",
//     dataType: "json",
//     success: function (response) {
//         activity.recording = response.serverRecording;
//         if (activity.recording) {
//             txtEnregistrement.textContent = "En cours...";
//             /* In jQuery */
//             // $("#enregistrement").text("En cours...");
//             changeButton(toggleButton, "red", "Arrêter");
//         }
//         main();
//     },
// });

function main() {
    // setInterval() se lance toutes les xxx millisecondes; ici 1000
    setInterval(() => {
        // Demander au serveur...
        let serverRequest = new XMLHttpRequest();
        serverRequest.onreadystatechange = () => {
            if (serverRequest.readyState === 4) {
                let response;
                try {
                    response = JSON.parse(serverRequest.response);
                    mesureLue.textContent = response?.mesure;
                    toggleButton.removeAttribute("disabled");
                    if (activity.recording && response?.dbRecord != null) {
                        const date = new Date(response.dbRecord?.horodatage);
                        buffer += `${humanReadableDate(date)} => ${response?.dbRecord?.mesure}\n`;
                        logger.textContent = buffer;
                        logger.scrollTop = logger.scrollHeight;
                    }
                } catch (error) {
                    response = {};
                    mesureLue.innerHTML = "<small>Server unreachable</small> ";
                    toggleButton.setAttribute("disabled", true);
                }
            }
        };
        serverRequest.open("POST", "/api/fetch", true);
        serverRequest.setRequestHeader("Content-type", "application/json");
        serverRequest.send();
        /* In jQuery */
        // $.ajax({
        //     type: "post",
        //     url: "/api/fetch",
        //     dataType: "json",
        //     success: function (response) {
        //         // ... la dernière mesure prise et l'affiche ...
        //         $("#mesure-lue").text(response.mesure);
        //         // ... réactive le bouton.
        //         toggleButton.removeAttribute("disabled");

        //         if (activity.recording && response?.dbRecord != null) {
        //             const date = new Date(response.dbRecord?.horodatage);
        //             buffer += `${humanReadableDate(date)} => ${response?.dbRecord?.mesure}\n`;
        //             logger.textContent = buffer;
        //             logger.scrollTop = logger.scrollHeight;
        //         }
        //     },
        // });
    }, 1000);

    toggleButton.addEventListener("click", () => {
        toggleButton.setAttribute("disabled", true);
        activity.recording = !activity.recording;

        let postActivity = new XMLHttpRequest();
        postActivity.open("POST", "/api/toggle", true);
        postActivity.setRequestHeader("Content-type", "application/json");
        postActivity.send(JSON.stringify(activity));
        /* In jQuery */
        // $.post("/api/toggle", activity);

        if (activity.recording) {
            txtEnregistrement.textContent = "En cours...";
            /* In jQuery */
            // $("#enregistrement").text("En cours...");
            changeButton(toggleButton, "red", "Arrêter");
        } else {
            txtEnregistrement.textContent = "Arrêt";
            /* In jQuery */
            // $("#enregistrement").text("Arrêt");
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
 * @param {string} color Valid = "red", "green" (defaults to blue)
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
