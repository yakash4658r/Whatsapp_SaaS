const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getSettings,
  updateBusinessSettings,
  updateAutoReply,
} = require("../controllers/settingsController");

const router = express.Router();

router.get("/", authMiddleware, getSettings);
router.put("/business", authMiddleware, updateBusinessSettings);
router.put("/auto-reply", authMiddleware, updateAutoReply);

module.exports = router;