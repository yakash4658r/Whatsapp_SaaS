const prisma = require("../config/prisma");

const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
      include: {
        autoReplySetting: true,
      },
    });

    if (!businessAccount) {
      return res.status(404).json({ message: "Business account not found" });
    }

    res.json({
      businessName: businessAccount.businessName,
      phoneNumber: businessAccount.phoneNumber,
      whatsappApiToken: businessAccount.whatsappApiToken || "",
      whatsappPhoneNumberId: businessAccount.whatsappPhoneNumberId || "",
      whatsappBusinessAccountId: businessAccount.whatsappBusinessAccountId || "",
      autoReplyMessage: businessAccount.autoReplySetting?.autoReplyMessage || "",
      autoReplyEnabled: businessAccount.autoReplySetting?.isEnabled ?? true,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateBusinessSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      businessName,
      phoneNumber,
      whatsappApiToken,
      whatsappPhoneNumberId,
      whatsappBusinessAccountId,
    } = req.body;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
    });

    if (!businessAccount) {
      return res.status(404).json({ message: "Business account not found" });
    }

    const updatedBusiness = await prisma.businessAccount.update({
      where: { userId },
      data: {
        businessName,
        phoneNumber,
        whatsappApiToken,
        whatsappPhoneNumberId,
        whatsappBusinessAccountId,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        businessName,
        phoneNumber,
      },
    });

    res.json({
      message: "Business settings updated successfully",
      business: updatedBusiness,
    });
  } catch (error) {
    console.error("Update business settings error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateAutoReply = async (req, res) => {
  try {
    const userId = req.user.id;
    const { autoReplyMessage, isEnabled } = req.body;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
      include: {
        autoReplySetting: true,
      },
    });

    if (!businessAccount) {
      return res.status(404).json({ message: "Business account not found" });
    }

    let autoReply;

    if (businessAccount.autoReplySetting) {
      autoReply = await prisma.autoReplySetting.update({
        where: { businessId: businessAccount.id },
        data: {
          autoReplyMessage,
          isEnabled,
        },
      });
    } else {
      autoReply = await prisma.autoReplySetting.create({
        data: {
          businessId: businessAccount.id,
          autoReplyMessage,
          isEnabled: isEnabled ?? true,
        },
      });
    }

    res.json({
      message: "Auto reply updated successfully",
      autoReply,
    });
  } catch (error) {
    console.error("Update auto reply error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getSettings,
  updateBusinessSettings,
  updateAutoReply,
};