const prisma = require("../config/prisma");

const createLead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { customerName, phoneNumber, firstMessage } = req.body;

    if (!phoneNumber || !firstMessage) {
      return res.status(400).json({ message: "Phone number and first message are required" });
    }

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
      },
    });

    res.status(201).json({
      message: "Lead created successfully",
      lead,
    });
  } catch (error) {
    console.error("Create lead error:", error);
    res.status(500).json({ message: "Server error" });
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

    const leads = await prisma.lead.findMany({
      where: {
        businessId: businessAccount.id,
        ...(status ? { status } : {}),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(leads);
  } catch (error) {
    console.error("Get leads error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateLeadStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const allowedStatuses = ["new", "contacted", "closed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

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

    res.json({
      message: "Lead status updated successfully",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("Update lead status error:", error);
    res.status(500).json({ message: "Server error" });
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

    res.json({
      totalLeads,
      newLeads,
      contactedLeads,
      closedLeads,
    });
  } catch (error) {
    console.error("Get dashboard metrics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createLead,
  getLeads,
  updateLeadStatus,
  getDashboardMetrics,
};