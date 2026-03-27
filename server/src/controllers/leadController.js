const prisma = require("../config/prisma");

const createLead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { customerName, phoneNumber, firstMessage } = req.body;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
    });

    if (!businessAccount) {
      return res.status(404).json({ message: "Business account not found" });
    }

    const lead = await prisma.lead.create({
      data: {
        businessId: businessAccount.id,
        customerName,
        phoneNumber,
        firstMessage,
        status: "new",
      },
    });

    return res.status(201).json(lead);
  } catch (error) {
    console.error("Create lead error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getLeads = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
    });

    if (!businessAccount) {
      return res.status(404).json({ message: "Business account not found" });
    }

    const whereClause = {
      businessId: businessAccount.id,
    };

    if (status && status !== "all") {
      whereClause.status = status;
    }

    const leads = await prisma.lead.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(leads);
  } catch (error) {
    console.error("Get leads error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
    });

    if (!businessAccount) {
      return res.status(404).json({ message: "Business account not found" });
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        businessId: businessAccount.id,
      },
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { status },
    });

    return res.status(200).json({
      message: "Lead status updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Update lead status error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getDashboardMetrics = async (req, res) => {
  try {
    const userId = req.user.id;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
    });

    if (!businessAccount) {
      return res.status(404).json({ message: "Business account not found" });
    }

    const totalLeads = await prisma.lead.count({
      where: {
        businessId: businessAccount.id,
      },
    });

    const newLeads = await prisma.lead.count({
      where: {
        businessId: businessAccount.id,
        status: "new",
      },
    });

    const contactedLeads = await prisma.lead.count({
      where: {
        businessId: businessAccount.id,
        status: "contacted",
      },
    });

    const closedLeads = await prisma.lead.count({
      where: {
        businessId: businessAccount.id,
        status: "closed",
      },
    });

    return res.status(200).json({
      totalLeads,
      newLeads,
      contactedLeads,
      closedLeads,
    });
  } catch (error) {
    console.error("Get dashboard metrics error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLead,
  getLeads,
  updateLeadStatus,
  getDashboardMetrics,
};