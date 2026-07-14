import { db } from '../db';
import { webhookIntegration } from '../db/schema';

// Helper to format price cents
function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export async function triggerWebhook(
  event: string,
  data: {
    purchase?: any;
    product?: any;
    chat?: any;
    message?: any;
  }
) {
  try {
    // Retrieve enabled integrations
    const activeIntegrations = await db.select().from(webhookIntegration);

    if (activeIntegrations.length === 0) return;

    // Build markdown message
    let text = '';

    switch (event) {
      case 'purchase.created': {
        const p = data.purchase;
        const prod = data.product;
        const price = formatPrice(prod?.priceCents || 0);
        text = `🎉 **New Sale!** Customer \`${p?.customerEmail}\` purchased **${prod?.name || 'Unknown Product'}** for \`${price}\`!`;
        break;
      }
      case 'purchase.refunded': {
        const p = data.purchase;
        const prod = data.product;
        text = `↩️ **Purchase Refunded:** Product **${prod?.name || 'Unknown Product'}** was refunded for customer \`${p?.customerEmail}\`.`;
        break;
      }
      case 'purchase.disputed': {
        const p = data.purchase;
        const prod = data.product;
        text = `⚠️ **Purchase Disputed:** Product **${prod?.name || 'Unknown Product'}** was disputed by customer \`${p?.customerEmail}\`!`;
        break;
      }
      case 'support.chat_opened': {
        const chat = data.chat;
        const ident = chat?.customerEmail || chat?.visitorId || 'Anonymous';
        text = `💬 **New Support Chat Started:** Customer/Visitor \`${ident}\` opened a support session (Chat ID: \`${chat?.id?.slice(0, 8)}\`).`;
        break;
      }
      case 'support.message_created': {
        const msg = data.message;
        const senderLabel = msg?.sender === 'agent' ? 'Support Agent' : 'Customer';
        text = `✉️ **New Support Message:** _${senderLabel}_: "${msg?.content}" in chat \`${msg?.chatId?.slice(0, 8)}\`.`;
        break;
      }
      case 'support.chat_closed': {
        const chat = data.chat;
        text = `🔒 **Support Chat Closed:** Chat session \`${chat?.id?.slice(0, 8)}\` has been closed.`;
        break;
      }
      case 'product.created': {
        const prod = data.product;
        const price = formatPrice(prod?.priceCents || 0);
        text = `📦 **Product Created:** **${prod?.name}** created with price \`${price}\`.`;
        break;
      }
      case 'product.updated': {
        const prod = data.product;
        text = `✏️ **Product Updated:** **${prod?.name}** details updated.`;
        break;
      }
      case 'product.deleted': {
        const prod = data.product;
        text = `🗑️ **Product Deleted:** **${prod?.name}** was deleted from the shop.`;
        break;
      }
      default:
        text = `🔔 **Notification:** Event \`${event}\` occurred.`;
    }

    for (const integration of activeIntegrations) {
      if (!integration.enabled || !integration.url) continue;

      let subEvents: string[] = [];
      try {
        subEvents = JSON.parse(integration.events) as string[];
      } catch {
        continue;
      }

      if (!subEvents.includes(event)) continue;

      // Prepare payload and format for Slack vs Discord
      let body: any = {};
      if (integration.id === 'slack') {
        const slackText = text.replace(/\*\*/g, '*');
        body = { text: slackText };
      } else if (integration.id === 'discord') {
        body = { content: text };
      }

      // Fire and forget / handle error per integration
      fetch(integration.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).catch((err) => {
        console.error(`[Payshelf] Webhook dispatch failed for ${integration.id}:`, err);
      });
    }
  } catch (err) {
    console.error('[Payshelf] Error triggering webhook notifications:', err);
  }
}
