const toggleButton = document.getElementById("toggle-button");
const logger = document.querySelector("#logger");
let buffer = "";
console.log(buffer);
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
                    const displayDate = `${date.getFullYear()}/${
                        date.getMonth() + 1
                    }/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
                    buffer += `${displayDate} => ${response?.dbRecord?.mesure}\n`;
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
