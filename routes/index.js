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

// La lecture série se fera jusqu'à rencontrer un retour à la ligne
const parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

let lastMesure;
let recording = false;
let currentRecord;

// À chaque réception de donnée série ("data"), lancer la fonction qui suit
parser.once("data", async () => {
    const record = await prisma.record.create({
        data: {},
    });
    currentRecord = record;
    console.log(record);
});

parser.on("data", async data => {
    //    console.log(`Data: ${data}`);
    lastMesure = data;
    if (recording && currentRecord != null) {
        const mesure = await prisma.mesure.create({
            data: {
                mesure: Number(lastMesure),
                idRecord: currentRecord.id,
            },
        });
        console.log(mesure);
    }
});

/* GET home page. */
router.get("/", async function (req, res, next) {
    res.render("index" /*, { mesure: lastMesure } */);
    //let result = await prisma.mesure.findMany({});
    //    console.table(result);
});

/* Quand la route "/api/mesure" est demandée, on envoie lastMesure au format JSON */
router.post("/api/mesure", (req, res) => {
    res.json({ mesure: lastMesure });
});

router.post("/api/toggle", (req, res) => {
    if (recording) {
        recording = false;
        currentRecord = null;
        console.log(`recording: ${recording}`);
        console.log(`currentRecord: ${currentRecord}`);
    } else {
        recording = true;
        console.log(`recording: ${recording}`);
    }
    req.preventDefault();
});

module.exports = router;
