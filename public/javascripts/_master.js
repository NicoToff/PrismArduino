/* Fichier avec variables globales */
const body = document.querySelector("body");
const [navAcquerir, navConsulter] = document.querySelectorAll("nav > a");

/**
 * Demande au serveur si on est en train d'enregistrer ou non.
 * Exécute la fonction passée en argument lorsque la réponse du serveur est obtenue.
 * La réponse est accessible en argument du callback.
 * @param {function} callback Une fonction à exécuter.
 */
async function isRecording(callback) {
    let serverRequest = new XMLHttpRequest();
    serverRequest.onreadystatechange = () => {
        if (serverRequest.readyState === 4) {
            callback(serverRequest.response);
        }
    };
    serverRequest.open("POST", "/", true);
    serverRequest.setRequestHeader("Content-type", "application/json");
    serverRequest.send();
}
