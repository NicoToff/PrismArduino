const express = require("express");
const router = express.Router();
// See https://serialport.io/docs/guide-usage
const { SerialPort } = require("serialport");
// See https://serialport.io/docs/api-parser-readline
const { ReadlineParser } = require("@serialport/parser-readline");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Ouverture d'une communication avec le port COM3 à 9600 bauds
const port = new SerialPort({
    path: "COM3",
    baudRate: 9600,
});

// Avec "parser", la lecture série se fera jusqu'à rencontrer un retour à la ligne
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

let lastMesure;
let recording = false;
let currentRecord;
let currentMesure;

// À chaque réception de données série ("data"), lancer la fonction qui suit.
parser.on("data", async data => {
    //    console.log(`Data: ${data}`);
    lastMesure = data;
    if (recording && currentRecord != null) {
        currentMesure = await prisma.mesure.create({
            data: {
                mesure: Number(lastMesure),
                idRecord: currentRecord.id,
            },
        });
        console.log(currentMesure);
    }
});

/* GET home page. */
router.get("/", async function (req, res, next) {
    res.render("index" /*, { mesure: lastMesure } */);
    //let result = await prisma.mesure.findMany({});
    //    console.table(result);
});

/* Envoie toutes les secondes l'état du boolean "recording" et la dernière mesure prise */
router.post("/api/fetch", (req, res) => {
    res.json({ mesure: lastMesure, enregistrement: recording, dbRecord: currentMesure });
});

/* Permet de changer l'état du boolean "recording" du côté serveur pour lancer/arrêter
   l'enregistrement de données dans la db.
*/
router.post("/api/toggle", async (req, res) => {
    if (recording) {
        // TODO: Ajout heure de fin
        const lolilol = await prisma.record.update({
            where: {
                id: currentRecord.id,
            },
            data: {
                fin: new Date(Date.now()),
            },
        });
        console.log(lolilol);
        recording = false;
        currentRecord = null;
    } else {
        recording = true;
        parser.once("data", async () => {
            const record = await prisma.record.create({
                data: {},
            });
            currentRecord = record;
            console.log(record);
        });
    }
    res.redirect("/");
});

module.exports = router;
