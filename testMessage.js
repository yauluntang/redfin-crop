
// or if using require:
const { createBot } = require('whatsapp-cloud-api');

(async () => {
  try {
    // replace the values below
    const from = '103671399300618';
    const token = 'EAAJ7LwQPrN4BADYxxXNU4LFDaK4GW4ZBXF72gV33LjMIW2lyvJDnqAZCrZA9r3nxue4ZCHYUsPZCAQ54mHs1Qz9CZCJpFQtKbILc4W3sS072CiguttH3LkuC2yrzxoK934LZCf86n7gR4jXwjZAfh0Viqm8bY0Q7GQrVYMcrO5rDAM4JEZBFKoQI7XCNDqzRJncbaZAZBZAenNEeIQZDZD';
    const to = '14109728966';
    const webhookVerifyToken = 'YOUR_WEBHOOK_VERIFICATION_TOKEN';

    // Create a bot that can send messages
    const bot = createBot(from, token);

    // Send text message
    const result = await bot.sendText(to, 'Hello world');


    // Start express server to listen for incoming messages
    // NOTE: See below under `Documentation/Tutorial` to learn how
    // you can verify the webhook URL and make the server publicly available

    /*
    await bot.startExpressServer({
      webhookVerifyToken,
    });
    
    // Listen to ALL incoming messages
    // NOTE: remember to always run: await bot.startExpressServer() first
    bot.on('message', async (msg) => {
      console.log(msg);
    
      if (msg.type === 'text') {
        await bot.sendText(msg.from, 'Received your text message!');
      } else if (msg.type === 'image') {
        await bot.sendText(msg.from, 'Received your image!');
      }
    });*/
  } catch (err) {
    console.log(err);
  }
})();