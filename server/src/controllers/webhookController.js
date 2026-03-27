const prisma = require("../config/prisma");
const { sendWhatsAppMessage } = require("../services/whatsappService");

const verifyWebhook = async (req, res) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
      console.log("Webhook verified successfully");
      return res.status(200).send(challenge);
    } else {
      console.log("Webhook verification failed");
      return res.sendStatus(403);
    }
  } catch (error) {
    console.error("Webhook verification error:", error);
    return res.sendStatus(500);
  }
};

const receiveWebhook = async (req, res) => {
  try {
    console.log("Incoming webhook payload:");
    console.dir(req.body, { depth: null });

    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) {
      return res.status(200).json({ message: "No value found" });
    }

    // Status update handling
   if (value.statuses) {
  console.log("Message status update received:");
  console.dir(value.statuses, { depth: null });

  const statusItem = value.statuses[0];

  if (statusItem?.status === "failed") {
    console.log("Auto reply delivery failed:");
    console.log({
      recipient: statusItem.recipient_id,
      errorCode: statusItem.errors?.[0]?.code,
      errorTitle: statusItem.errors?.[0]?.title,
      errorMessage: statusItem.errors?.[0]?.message,
    });
  }

  return res.status(200).json({
    message: "STATUS_RECEIVED",
  });
}

    // Incoming customer message handling
    if (value.messages) {
      const message = value.messages[0];
      const contact = value.contacts?.[0];
      const metadata = value.metadata;

      const customerPhone = message?.from || "";
      const customerName = contact?.profile?.name || "Unknown";
      const messageText = message?.text?.body || "";
      const phoneNumberId = metadata?.phone_number_id || "";

      console.log("Parsed incoming message:");
      console.log({
        customerPhone,
        customerName,
        messageText,
        phoneNumberId,
      });

      const businessAccount = await prisma.businessAccount.findFirst({
        where: {
          whatsappPhoneNumberId: phoneNumberId,
        },
        include: {
          autoReplySetting: true,
        },
      });

      console.log("Business account found:", businessAccount);

      if (!businessAccount) {
        return res.status(200).json({
          message: "BUSINESS_NOT_FOUND",
        });
      }

      const existingLead = await prisma.lead.findFirst({
        where: {
          businessId: businessAccount.id,
          phoneNumber: customerPhone,
        },
      });

      if (!existingLead) {
        const newLead = await prisma.lead.create({
          data: {
            businessId: businessAccount.id,
            customerName: customerName,
            phoneNumber: customerPhone,
            firstMessage: messageText,
            status: "new",
          },
        });

        console.log("New lead created:", newLead);
      } else {
        console.log("Lead already exists");
      }

      const autoReply = businessAccount.autoReplySetting;

      if (
        autoReply &&
        autoReply.isEnabled &&
        autoReply.autoReplyMessage &&
        businessAccount.whatsappApiToken &&
        businessAccount.whatsappPhoneNumberId
      ) {
        try {
          const sendResult = await sendWhatsAppMessage({
            accessToken: businessAccount.whatsappApiToken,
            phoneNumberId: businessAccount.whatsappPhoneNumberId,
            to: customerPhone,
            message: autoReply.autoReplyMessage,
          });

          console.log("Auto reply sent successfully:", sendResult);
        } catch (sendError) {
          console.error("Failed to send auto reply");
        }
      } else {
        console.log("Auto reply skipped: missing config or disabled");
      }

      return res.status(200).json({
        message: "MESSAGE_RECEIVED_AND_LEAD_PROCESSED",
      });
    }

    return res.status(200).json({
      message: "EVENT_RECEIVED_BUT_NOT_PROCESSED",
    });
  } catch (error) {
    console.error("Webhook receive error full:");
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = {
  verifyWebhook,
  receiveWebhook,
};