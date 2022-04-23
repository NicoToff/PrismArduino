const toggleButton = document.getElementById("toggle-button");

// setInterval() se lance toutes les xxx millisecondes
setInterval(() => {
    // Demander au serveur la nouvelle mesure...
    $.ajax({
        type: "post",
        url: "/api/mesure",
        dataType: "json",
        success: function (response) {
            $("#mesure-lue").text(response.mesure); // ... et affiche
        },
    });
}, 1000);

setInterval(() => {
    $.ajax({
        type: "post",
        url: "/api/enregistrement",
        dataType: "json",
        success: function (response) {
            if (response.enregistrement === true) {
                $("#enregistrement").text("En cours...");
                toggleButton.innerText = "Arrêter";
                toggleButton.classList.remove("btn-success");
                toggleButton.classList.add("btn-danger");
            } else {
                $("#enregistrement").text("Arrêt");
                toggleButton.innerText = "Démarrer";
                toggleButton.classList.remove("btn-danger");
                toggleButton.classList.add("btn-success");
            }
        },
    });
}, 1000);
