import { FormData } from '../types';
import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../constants';

export const sendTelegramMessage = async (formData: FormData, agentNumber: string): Promise<void> => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.error('Telegram Bot Token or Chat ID is not configured.');
    // In a real app, you might not want to alert this, but for demonstration:
    alert('Service is temporarily unavailable. Configuration missing.');
    throw new Error('Telegram credentials are not set.');
  }

  const message = `
New Transfer Request:
---------------------
Agent Number Used: ${agentNumber}
Sender Operator: ${formData.senderOperator}
Amount Sent: ${formData.amount} BDT
Sender Number: ${formData.senderNumber}
Transaction ID: ${formData.transactionId}
Final Receiver Number: ${formData.receiverNumber}
---------------------
Please process this request.
`;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.description || 'Failed to send message to Telegram.');
  }
};
