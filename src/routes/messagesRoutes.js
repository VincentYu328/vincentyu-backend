// backend/src/routes/messagesRoutes.js
import express from "express";
import db from "../database/db.js";

const router = express.Router();

// GET /api/messages  (Admin only)
router.get("/", async (req, res) => {
  try {
    const rows = await db.all(`SELECT * FROM messages ORDER BY id DESC`);
    res.json({ messages: rows });
  } catch (err) {
    console.error("DB Select Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET /api/messages/:id
router.get("/:id", async (req, res) => {
  try {
    const row = await db.get(`SELECT * FROM messages WHERE id = ?`, [
      req.params.id,
    ]);

    if (!row) return res.status(404).json({ error: "Not found" });

    res.json(row);
  } catch (err) {
    console.error("DB Get Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE /api/messages/:id
router.delete("/:id", async (req, res) => {
  try {
    await db.run(`DELETE FROM messages WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DB Delete Error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
