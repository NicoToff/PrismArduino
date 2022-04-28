const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// let records;

/* GET db page. */
router.get("/", async function (req, res, next) {
    const records = await prisma.record.findMany();
    res.render("db", { dbRecords: records });
});

// router.post("/", function (req, res, next) {
//     res.json({ dbRecords: records });
//     console.log(records);
// });

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
        const mesuresFound = await prisma.mesure.deleteMany({
            where: {
                idRecord: id,
            },
        });
        const recordFound = await prisma.record.delete({
            where: {
                id: id,
            },
        });
        console.table(mesuresFound);
        console.log(recordFound);
        res.redirect("/db");
    } catch (error) {
        console.log(error);
        res.redirect("/db");
    }
});
// router.post("/api/db", async (req, res) => {
//     const searchId = req.body.search;
//     const mesuresFound = await prisma.mesure.findMany({
//         where: {
//             idRecord: searchId,
//         },
//     });
//     console.table(mesuresFound);
//     res.json(mesuresFound);
// });

module.exports = router;
