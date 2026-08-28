import { db } from './db.js';

export async function sendTelegramMessage(text, targetChatId = null) {
  const settings = db.getSettings();
  const token = process.env.TELEGRAM_BOT_TOKEN || settings.botToken;
  const adminChatId = targetChatId || process.env.TELEGRAM_ADMIN_CHAT_ID || settings.adminChatId;

  const logEntry = {
    timestamp: new Date().toISOString(),
    text,
    status: 'sent',
    targetChatId: adminChatId || 'Simulator'
  };

  if (!token || !adminChatId) {
    console.log('[Telegram Bot Simulation Notice]: Token or Chat ID not configured. Message logged to simulator.');
    logEntry.note = 'Simulated (No token/chatId configured in .env)';
    db.addTelegramLog(logEntry);
    return { success: true, simulated: true, message: 'Message logged to Telegram simulator.' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: adminChatId,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    if (data.ok) {
      logEntry.status = 'delivered';
      db.addTelegramLog(logEntry);
      return { success: true, simulated: false, data };
    } else {
      logEntry.status = 'failed';
      logEntry.error = data.description;
      db.addTelegramLog(logEntry);
      return { success: false, error: data.description };
    }
  } catch (err) {
    console.error('Telegram API fetch error:', err);
    logEntry.status = 'error';
    logEntry.error = err.message;
    db.addTelegramLog(logEntry);
    return { success: false, error: err.message };
  }
}

export async function notifyNewOrderToTelegram(order) {
  const itemsText = order.items
    .map((item, idx) => `${idx + 1}. <b>${item.title}</b> x${item.quantity} - ${item.price * item.quantity} ETB`)
    .join('\n');

  const text = `
🛒 <b>አዲስ ትዕዛዝ ደርሷል! (New Order Received)</b>

🆔 <b>Order ID:</b> #${order.id}
👤 <b>ስም (Name):</b> ${order.customerName}
📞 <b>ስልክ (Phone):</b> <code>${order.phone}</code>
📧 <b>ኢሜይል (Email):</b> ${order.customerEmail || 'N/A'}
✈️ <b>Telegram:</b> ${order.telegramUsername || 'N/A'}
📍 <b>አድራሻ (Address):</b> ${order.address}
💳 <b>የክፍያ መንገድ:</b> ${order.paymentMethod}
📝 <b>ማስታወሻ / ሳይዝ:</b> ${order.notes || 'ምንም አልተጻፈም'}

📦 <b>የታዘዙ እቃዎች:</b>
${itemsText}

💰 <b>አጠቃላይ ክፍያ:</b> <b>${order.totalAmount} ETB (ብር)</b>
📅 <b>ቀን:</b> ${new Date(order.date).toLocaleString()}

ℹ️ <i>ማስታወሻ፡ በአድሚን ዳሽቦርዱ ላይ የትዕዛዙን ሁኔታ (Status) መቀየር ይችላሉ።</i>
  `.trim();

  return await sendTelegramMessage(text);
}

export async function notifyOrderStatusChange(order) {
  const statusEmoji = {
    'Pending': '⏳ <b>በመጠባበቅ ላይ</b>',
    'Processing': '⚙️ <b>በመሰናዳት ላይ</b>',
    'Shipped': '🚚 <b>በጉዞ ላይ (የተላከ)</b>',
    'Completed': '✅ <b>በተሳካ ሁኔታ የተጠናቀቀ</b>',
    'Cancelled': '❌ <b>የተሰረዘ</b>'
  };

  const text = `
🔔 <b>የትዕዛዝ ሁኔታ ማሻሻያ (Order Update)</b>

🆔 <b>Order ID:</b> #${order.id}
👤 <b>ደንበኛ:</b> ${order.customerName}
📦 <b>ሁኔታ (Status):</b> ${statusEmoji[order.status] || order.status}
💰 <b>አጠቃላይ:</b> ${order.totalAmount} ETB

ማሺ ገበያን ስለጠቀሙ እናመሰግናለን! 🙏
  `.trim();

  return await sendTelegramMessage(text);
}
