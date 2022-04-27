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
let dbCurrentRecord = null;
let dbMesure = null;

/* À chaque réception de données série ("data"), lancer la fonction qui suit. */
parser.on("data", async data => {
    //    console.log(`Data: ${data}`);
    lastMesure = data;
    if (recording && dbCurrentRecord != null) {
        dbMesure = await prisma.mesure.create({
            data: {
                mesure: Number(lastMesure),
                idRecord: dbCurrentRecord.id,
            },
        });
        console.log(dbMesure);
    }
});

/* GET home page. */
router.get("/", async function (req, res, next) {
    res.render("index");
    //let result = await prisma.mesure.findMany({});
    //    console.table(result);
});

router.post("/", (req, res) => {
    res.json({ serverRecording: recording });
});

/* Envoie toutes les secondes l'état du boolean "recording" et la dernière mesure prise */
router.post("/api/fetch", (req, res) => {
    res.json({ mesure: lastMesure, dbRecord: dbMesure });
});

/* Permet de changer l'état du boolean "recording" du côté serveur pour lancer/arrêter
   l'enregistrement de données dans la db.
*/
router.post("/api/toggle", async (req, res) => {
    if (recording && dbCurrentRecord != null) {
        const updatedRecord = await prisma.record.update({
            where: {
                id: dbCurrentRecord.id,
            },
            data: {
                fin: new Date(Date.now()),
            },
        });
        console.log("==> Fin de l'enregistrement #" + dbCurrentRecord.id);
        console.log(updatedRecord);
        dbCurrentRecord = null;
        dbMesure = null;
    } else {
        parser.once("data", async () => {
            const record = await prisma.record.create({
                data: {},
            });
            dbCurrentRecord = record;
            console.log("==> Début de l'enregistrement #" + dbCurrentRecord.id);
            console.log(record);
        });
    }
    recording = req.body.recording;
});

module.exports = router;
