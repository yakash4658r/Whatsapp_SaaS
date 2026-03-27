require("dotenv").config();
const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");

const authRoutes = require("./routes/authRoutes");
const leadRoutes = require("./routes/leadRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ message: "Server and DB are running" });
  } catch (error) {
    res.status(500).json({ message: "DB connection failed" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/webhook", webhookRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});