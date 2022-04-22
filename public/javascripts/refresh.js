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
