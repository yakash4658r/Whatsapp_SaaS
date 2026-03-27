const prisma = require("../config/prisma");

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalLeads = await prisma.lead.count();
    const activeUsers = await prisma.user.count({
      where: { isActive: true },
    });
    const disabledUsers = await prisma.user.count({
      where: { isActive: false },
    });

    return res.status(200).json({
      totalUsers,
      totalLeads,
      activeUsers,
      disabledUsers,
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const disableUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

   if (user.role === "admin") {
  return res.status(400).json({ message: "Admin user cannot be disabled" });
}

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return res.status(200).json({
      message: "User disabled successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Disable user error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  disableUser,
};