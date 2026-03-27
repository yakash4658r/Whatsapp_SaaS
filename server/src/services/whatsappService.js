const axios = require("axios");

const sendWhatsAppMessage = async ({ accessToken, phoneNumberId, to, message }) => {
  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "WhatsApp send message error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = {
  sendWhatsAppMessage,
};