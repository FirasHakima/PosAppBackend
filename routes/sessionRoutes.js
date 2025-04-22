const express = require("express");
const router = express.Router();
const Session = require("../models/Session");
const Facture = require("../models/Facture");
const Transaction = require("../models/Transaction");
const Prestation = require("../models/Prestation");
const Article = require("../models/Articles");

// GET all sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Session.findAll({
      include: [
        { model: Facture, as: "factures" },
        { model: Transaction, as: "transactions" },
        { model: Prestation, as: "prestation" },
      ],
    });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
  }
});

// GET a single session by ID
router.get("/sessions/:id", async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id, {
      include: [
        { model: Facture, as: "factures" },
        { model: Transaction, as: "transactions" },
        { model: Prestation, as: "prestation" },
      ],
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.status(200).json(session);
  } catch (error) {
    res.status(500).json({ message: "Error fetching session", error: error.message });
  }
});

// CREATE a session
router.post("/sessions", async (req, res) => {
  const {
    factureData,
    transactionData,
    prestationData,
    ...sessionData
  } = req.body;

  try {
    const fonds = Number(sessionData.fondsDeCaisse);
    if (isNaN(fonds)) {
      return res.status(400).json({ message: "Missing or invalid fondsDeCaisse" });
    }
    sessionData.fondsDeCaisse = fonds;

    const session = await Session.create(sessionData);

    // Handle Factures
    if (factureData) {
      const factures = Array.isArray(factureData) ? factureData : [factureData];

      for (const facture of factures) {
        const articleExists = await Article.findByPk(facture.articleId);
        if (!articleExists) {
          return res.status(400).json({
            message: `Article with ID ${facture.articleId} does not exist`
          });
        }

        await Facture.create({ ...facture, sessionId: session.id });
      }
    }

    // Handle Transactions
    if (transactionData) {
      const transactions = Array.isArray(transactionData) ? transactionData : [transactionData];
      for (const transaction of transactions) {
        await Transaction.create({ ...transaction, sessionId: session.id });
      }
    }

    // Handle Prestation
    if (prestationData) {
      await Prestation.create({ ...prestationData, sessionId: session.id });
    }

    res.status(201).json({
      message: "Session created successfully",
      session
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create session", error: error.message });
  }
});

// UPDATE a session
router.put("/sessions/:id", async (req, res) => {
  try {
    const sessionId = req.params.id;
    if (!sessionId || sessionId === "undefined") {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    const session = await Session.findByPk(sessionId, {
      include: [{ model: Facture, as: "factures" }]
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    await session.update({
      fondsDeCaisse: req.body.fondsDeCaisse
    });

    // Prestation
    if (req.body.prestation) {
      const prestation = await Prestation.findOne({ where: { sessionId: session.id } });
      if (prestation) {
        await prestation.update(req.body.prestation);
      } else {
        await Prestation.create({ ...req.body.prestation, sessionId: session.id });
      }
    }

    // Factures
    if (req.body.factures && Array.isArray(req.body.factures)) {
      for (const factureData of req.body.factures) {
        const articleExists = await Article.findByPk(factureData.articleId);
        if (!articleExists) {
          return res.status(400).json({ message: `Article with id ${factureData.articleId} does not exist` });
        }

        if (factureData.quantite > articleExists.stock) {
          return res.status(400).json({ message: `Not enough stock for article with id ${factureData.articleId}` });
        }

        let facture = null;
        if (factureData.id) {
          facture = await Facture.findOne({
            where: { id: factureData.id, sessionId: session.id }
          });
        }

        if (facture) {
          await facture.update(factureData);
        } else {
          await Facture.create({ ...factureData, sessionId: session.id });
        }

        const updatedStock = articleExists.stock - factureData.quantite;
        await articleExists.update({ stock: updatedStock });
      }
    }

    // Transactions
    if (req.body.transactions && Array.isArray(req.body.transactions)) {
      for (const transactionData of req.body.transactions) {
        if (!transactionData.date || !transactionData.montant || transactionData.fondsDeCaisse === undefined) {
          return res.status(400).json({ message: "Transaction data is invalid" });
        }

        await Transaction.create({
          ...transactionData,
          sessionId: session.id,
        });
      }
    }

    res.status(200).json({ message: "Session updated successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Failed to update session", error: error.message });
  }
});

// DELETE a session
router.delete("/sessions/:id", async (req, res) => {
  try {
    const session = await Session.findByPk(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    await session.destroy();
    res.status(200).json({ message: "Session deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete session", error: error.message });
  }
});

module.exports = router;
