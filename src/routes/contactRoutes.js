import express from "express";
import db from "../database/db.js";
import { sendContactEmail } from "../services/emailService.js";  // ✅ 添加这行

const router = express.Router();

// POST /api/contact
router.post("/", async (req, res) => {
  const { name, email, phone, message } = req.body;  // ✅ 添加 phone

  console.log('📬 Contact form received:', { name, email, phone: phone || 'N/A' });

  if (!name || !email || !message) {
    console.log('❌ Missing required fields');
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1️⃣ 保存到数据库
    console.log('💾 Saving to database...');
    const result = await db.run(
      `INSERT INTO messages (name, email, phone, message, date)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, message, new Date().toISOString().slice(0, 10)]
    );
    console.log('✅ Message saved with ID:', result.lastID);

    // 2️⃣ 发送邮件通知
    console.log('📧 Sending email notification...');
    try {
      await sendContactEmail({ name, email, phone, message });
      console.log('✅ Email sent successfully');
    } catch (emailError) {
      console.error('⚠️ Email sending failed:', emailError.message);
      // 邮件失败不影响主流程
    }

    res.json({ success: true, id: result.lastID });

  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;