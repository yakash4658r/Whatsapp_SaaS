const prisma = require("../config/prisma");
const { sendWhatsAppMessage } = require("../services/whatsappService");

const sendBroadcast = async (req, res) => {
  try {
    console.log("Broadcast API hit");

    const userId = req.user.id;
    const { messageText } = req.body;

    console.log("User ID:", userId);
    console.log("Message Text:", messageText);

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
    });

    console.log("Business account:", businessAccount);

    if (!businessAccount) {
      return res.status(404).json({ message: "Business account not found" });
    }

    const leads = await prisma.lead.findMany({
      where: {
        businessId: businessAccount.id,
      },
      take: 100,
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Fetched leads:", leads);

    if (leads.length === 0) {
      return res.status(400).json({ message: "No leads found for broadcast" });
    }

    const broadcast = await prisma.broadcast.create({
      data: {
        businessId: businessAccount.id,
        messageText,
        totalRecipients: leads.length,
        status: "processing",
      },
    });

    console.log("Broadcast created:", broadcast);

    for (const lead of leads) {
      console.log("Sending to lead:", lead.phoneNumber);

      try {
        await sendWhatsAppMessage({
          accessToken: businessAccount.whatsappApiToken,
          phoneNumberId: businessAccount.whatsappPhoneNumberId,
          to: lead.phoneNumber,
          message: messageText,
        });

        console.log("Message sent to:", lead.phoneNumber);

        await prisma.broadcastLog.create({
          data: {
            broadcastId: broadcast.id,
            leadId: lead.id,
            phoneNumber: lead.phoneNumber,
            sendStatus: "sent",
          },
        });
      } catch (error) {
        console.log("Message failed for:", lead.phoneNumber);
        console.log("Error:", error.response?.data || error.message);

        await prisma.broadcastLog.create({
          data: {
            broadcastId: broadcast.id,
            leadId: lead.id,
            phoneNumber: lead.phoneNumber,
            sendStatus: "failed",
            errorMessage:
              error.response?.data?.error?.message || error.message,
          },
        });
      }
    }

    await prisma.broadcast.update({
      where: { id: broadcast.id },
      data: {
        status: "completed",
      },
    });

    console.log("Broadcast completed");

    return res.status(200).json({
      message: "Broadcast processed successfully",
      broadcastId: broadcast.id,
    });
  } catch (error) {
    console.error("Send broadcast error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getBroadcastHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const businessAccount = await prisma.businessAccount.findUnique({
      where: { userId },
    });

    if (!businessAccount) {
      return res.status(404).json({ message: "Business account not found" });
    }

    const broadcasts = await prisma.broadcast.findMany({
      where: {
        businessId: businessAccount.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        logs: true,
      },
    });

    return res.status(200).json(broadcasts);
  } catch (error) {
    console.error("Get broadcast history error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  sendBroadcast,
  getBroadcastHistory,
};