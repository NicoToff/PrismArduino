/* Fichier avec variables et fonctions disponibles de façon globale */
"use strict";
const body = document.querySelector("body");
const [navAcquerir, navConsulter] = document.querySelectorAll("nav > a");

/**
 * Requête POST au serveur pour savoir si on est en train d'enregistrer ou non.
 * Exécute la fonction passée en argument lorsque la réponse du serveur est obtenue.
 * Un boolean est accessible en argument du callback; il est "true" si on enregistre, sinon "false".
 * @param {function} callback Une fonction à exécuter.
 */
async function recordingState(callback) {
    let serverRequest = new XMLHttpRequest();
    serverRequest.onreadystatechange = () => {
        if (serverRequest.readyState === 4) {
            callback(JSON.parse(serverRequest.response).serverRecording);
        }
    };
    serverRequest.open("POST", "/", true);
    serverRequest.setRequestHeader("Content-type", "application/json");
    serverRequest.send();
}
