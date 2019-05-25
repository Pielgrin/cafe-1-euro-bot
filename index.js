const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const verificationController = require('./controllers/verification');
const messageWebhookController = require('./controllers/messageWebhook')

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => console.log('Webhook server is listening, port 3000'));
app.get('/', verificationController)
app.post('/', messageWebhookController)