"use strict";
const express = require("express");
const router = express.Router();

const { SerialPort } = require("serialport"); // See https://serialport.io/docs/guide-usage
const { ReadlineParser } = require("@serialport/parser-readline"); // See https://serialport.io/docs/api-parser-readline

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
});

/* Envoie l'état du boolean recording */
router.post("/", (req, res) => {
    res.json({ serverRecording: recording });
});

/* Envoie au client la dernière mesure prise et (éventuellement) la dernière mesure enregistrée dans la database 
   En pratique, les deux valeurs doivent évidemment correspondre */
router.post("/api/fetch", (req, res) => {
    res.json({ mesure: lastMesure, dbMesure: dbMesure });
});

/* Réception du côté serveur de l'état du boolean "recording" se trouvant côté client
   et lancement ou arrêt de l'enregistrement */
router.post("/api/toggle", async (req, res) => {
    recording = req.body.clientRecording;
    if (recording && dbCurrentRecord == null) {
        parser.once("data", async () => {
            const record = await prisma.record.create({
                data: {
                    remarques: req.body.notes,
                },
            });
            dbCurrentRecord = record;
            console.log("==> Début de l'enregistrement #" + dbCurrentRecord.id);
            console.log(record);
        });
    } else if (dbCurrentRecord != null) {
        const updatedRecord = await prisma.record.update({
            where: {
                id: dbCurrentRecord?.id,
            },
            data: {
                end: new Date(Date.now()),
            },
        });
        console.log("==> Fin de l'enregistrement #" + dbCurrentRecord.id);
        console.log(updatedRecord);
        /* RÀZ des variables stockant l'enregistrement et la dernière mesure */
        dbCurrentRecord = null;
        dbMesure = null;
    }
});

module.exports = router;
