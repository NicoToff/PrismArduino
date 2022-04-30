"use strict";
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/* GET db page. */
router.get("/", async function (req, res, next) {
    const records = await prisma.record.findMany();
    res.render("db", { dbRecords: records });
});

// Avec ":id", on récupère la valeur qui se trouve derrière le "/" dans la propriété "req.params.id"
router.get("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const recordFound = await prisma.record.findUnique({
            where: {
                id: id,
            },
        });
        const mesuresFound = await prisma.mesure.findMany({
            where: {
                idRecord: id,
            },
        });
        res.render("detail", { mesures: mesuresFound, record: recordFound });
    } catch (error) {
        res.redirect("/db");
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        // Suppression de toutes les mesures dans l'enregistrement
        const mesuresFound = await prisma.mesure.deleteMany({
            where: {
                idRecord: id,
            },
        });
        console.log(`${mesuresFound.count} mesures supprimées.`);
        // Suppression de l'enregistrement
        const recordFound = await prisma.record.delete({
            where: {
                id: id,
            },
        });
        console.log(`Enregistrement #${recordFound.id} supprimé.`);
        res.redirect("/db");
    } catch (error) {
        console.log(error);
        res.redirect("/db");
    }
});

module.exports = router;
