navAcquerir.classList.add("active");

const btnToggle = document.getElementById("toggle-button");
btnToggle.setAttribute("disabled", true);
setTimeout(() => {
    btnToggle.removeAttribute("disabled");
}, 1000);
const txtNewEntries = document.querySelector("#logger");
const lblMesureLue = document.getElementById("mesure-lue");
const txtNotes = document.getElementById("notes");
const lblEnregistrement = document.getElementById("enregistrement");

let newEntriesBuffer = "";
let recording; // Boolean

isRecording(res => {
    try {
        let response = JSON.parse(res);
        recording = response.serverRecording;
        if (recording) {
            lblEnregistrement.textContent = "En cours...";
            /* In jQuery */
            // $("#enregistrement").text("En cours...");
            changeButton(btnToggle, "red", "Arrêter");
        }
        body.classList.remove("concealed");
        main();
    } catch (error) {
        location.reload();
    }
});

// $.ajax({
//     type: "post",
//     url: "/",
//     dataType: "json",
//     success: function (response) {
//         recording = response.serverRecording;
//         if (recording) {
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
                //                console.log(`Server's recording: ${JSON.parse(serverRequest.response).currentState}`);
                try {
                    response = JSON.parse(serverRequest.response);
                    lblMesureLue.textContent = response?.mesure;

                    if (recording && response?.dbRecord != null) {
                        const date = new Date(response.dbRecord?.horodatage);
                        newEntriesBuffer += `${humanReadableDate(date)} => ${response?.dbRecord?.mesure}\n`;
                        txtNewEntries.textContent = newEntriesBuffer;
                        txtNewEntries.scrollTop = txtNewEntries.scrollHeight; // Scroll to bottom
                    }
                } catch (error) {
                    response = {};
                    lblMesureLue.innerHTML = "<small>Server unreachable</small> ";
                    btnToggle.setAttribute("disabled", true);
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

        //         if (recording && response?.dbRecord != null) {
        //             const date = new Date(response.dbRecord?.horodatage);
        //             buffer += `${humanReadableDate(date)} => ${response?.dbRecord?.mesure}\n`;
        //             logger.textContent = buffer;
        //             logger.scrollTop = logger.scrollHeight;
        //         }
        //     },
        // });
    }, 1000);

    btnToggle.addEventListener("click", () => {
        btnToggle.setAttribute("disabled", true);
        setTimeout(() => {
            btnToggle.removeAttribute("disabled"); // Ce delay évite de spammer le bouton
        }, 2000);
        recording = !recording;

        let postActivity = new XMLHttpRequest();
        postActivity.open("POST", "/api/toggle", true);
        postActivity.setRequestHeader("Content-type", "application/json");
        postActivity.send(JSON.stringify({ clientRecording: recording, notes: txtNotes.value }));
        /* In jQuery */
        // $.post("/api/toggle", {activity: recording});

        if (recording) {
            lblEnregistrement.textContent = "En cours...";
            /* In jQuery */
            // $("#enregistrement").text("En cours...");
            changeButton(btnToggle, "red", "Arrêter");
        } else {
            lblEnregistrement.textContent = "Arrêt";
            /* In jQuery */
            // $("#enregistrement").text("Arrêt");
            changeButton(btnToggle, "green", "Démarrer");
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
    return `${date.getFullYear?.()}/${date.getMonth?.() + 1}/${date.getDate?.()} ${
            Number(date.getHours?.())   < 10 ? "0" + date.getHours?.()   : date.getHours?.()}:${
            Number(date.getMinutes?.()) < 10 ? "0" + date.getMinutes?.() : date.getMinutes?.()}:${
            Number(date.getSeconds?.()) < 10 ? "0" + date.getSeconds?.() : date.getSeconds?.()}`;
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
        button.classList.remove("btn-primary");
        button.classList.remove("btn-danger");
        button.classList.add("btn-success");
    } else if (color === "red") {
        button.innerText = text;
        button.classList.remove("btn-primary");
        button.classList.remove("btn-success");
        button.classList.add("btn-danger");
    } else {
        button.innerText = text;
        button.classList.add("btn-primary");
        button.classList.remove("btn-success");
        button.classList.remove("btn-danger");
    }
}
