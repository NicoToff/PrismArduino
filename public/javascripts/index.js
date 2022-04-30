"use strict";
navAcquerir.classList.add("active");

const btnToggle = document.getElementById("toggle-button");
const txtNewEntries = document.querySelector("#logger");
const lblMesureLue = document.getElementById("mesure-lue");
const txtNotes = document.getElementById("notes");
const lblEnregistrement = document.getElementById("enregistrement");

let newEntriesBuffer = "";
let recording; // Boolean

recordingState(serverRecording => {
    try {
        recording = serverRecording;
        if (recording) {
            lblEnregistrement.textContent = "En cours...";
            /* In jQuery */
            // $("#enregistrement").text("En cours...");
            changeButton(btnToggle, "red", "Arrêter");
        }
        btnToggle.removeAttribute("disabled");
        body.classList.remove("concealed");
        main();
    } catch (error) {
        setTimeout(() => location.reload(), 1000);
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
    // Toutes les secondes...
    setInterval(() => {
        // ... (1) on demande au serveur ...
        let serverRequest = new XMLHttpRequest();
        serverRequest.onreadystatechange = () => {
            if (serverRequest.readyState === 4) {
                let response = {};
                try {
                    // (3) ... puis on traite la réponse ...
                    response = JSON.parse(serverRequest.response);
                    lblMesureLue.textContent = response?.mesure;

                    if (recording && response?.dbMesure != null) {
                        const date = new Date(response.dbMesure?.horodatage);
                        newEntriesBuffer += `${humanReadableDate(date)} => ${response?.dbMesure?.mesure}\n`;
                        txtNewEntries.textContent = newEntriesBuffer;
                        txtNewEntries.scrollTop = txtNewEntries.scrollHeight; // Scroll to bottom
                    }
                } catch (error) {
                    // (3bis) ou un message d'erreur si la réponse n'était pas parsable.
                    lblMesureLue.innerHTML = "<small>Server unreachable</small> ";
                    btnToggle.setAttribute("disabled", true);
                }
            }
        };
        // ... (2) d'aller chercher la dernière mesure prise et (éventuellement) la mesure enregistrée dans la database ...
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

        //         if (recording && response?.dbMesure != null) {
        //             const date = new Date(response.dbMesure?.horodatage);
        //             buffer += `${humanReadableDate(date)} => ${response?.dbMesure?.mesure}\n`;
        //             logger.textContent = buffer;
        //             logger.scrollTop = logger.scrollHeight;
        //         }
        //     },
        // });
    }, 1000);

    btnToggle.addEventListener("click", () => {
        btnToggle.setAttribute("disabled", true);
        setTimeout(() => btnToggle.removeAttribute("disabled"), 2000); // Ce retard évite de spammer le bouton (le serveur le prend mal)
        recording = !recording;

        // Envoi du boolean "recording" au serveur
        let sendRecording = new XMLHttpRequest();
        sendRecording.open("POST", "/api/toggle", true);
        sendRecording.setRequestHeader("Content-type", "application/json");
        sendRecording.send(JSON.stringify({ clientRecording: recording, notes: txtNotes.value }));
        /* In jQuery */
        // $.post("/api/toggle", { clientRecording: recording, notes: txtNotes.value });

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
 * Avec une date, renvoie une string au format "YYYY/MM/DD HH:mm:ss".
 * @param {Date} date
 * @returns Une string de ce genre: "2022/4/26 12:54:56"
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
 * Change l'aspect d'un bouton
 * @param {HTMLButtonElement} button Un bouton
 * @param {string} color Valide = "red", "green" (sinon, sera bleu par défaut)
 * @param {string} text Le nouveau texte pour le bouton (sinon sera "OK" par défaut)
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
