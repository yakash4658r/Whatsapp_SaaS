const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getAdminStats,
  getAllUsers,
  disableUser,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/stats", authMiddleware, roleMiddleware(["admin"]), getAdminStats);
router.get("/users", authMiddleware, roleMiddleware(["admin"]), getAllUsers);
router.patch("/users/:id/disable", authMiddleware, roleMiddleware(["admin"]), disableUser);

module.exports = router;