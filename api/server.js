const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const path = require('path');

const app = express();
const PORT = 3000; // Porta local para rodar o servidor

app.use(cors({ origin: '*' }));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API está funcionando!');
});

let qrCodeData = '';
let isAuthenticated = false;

const userId = 'unique_user_id';

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: userId,
        dataPath: path.resolve(__dirname, `./whatsapp_auth_data/${userId}`),
    }),
});

client.on('qr', (qr) => {
    if (!isAuthenticated) {
        qrcode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error('Erro ao gerar QR Code:', err);
                return;
            }
            qrCodeData = url;
        });
    }
});

client.on('ready', () => {
    isAuthenticated = true;
    qrCodeData = '';
    console.log('Cliente do WhatsApp está pronto!');
});

app.get('/get-qr', (req, res) => {
    if (isAuthenticated) {
        res.status(200).json({ message: 'Já autenticado' });
    } else if (qrCodeData) {
        res.status(200).json({ qrCode: qrCodeData });
    } else {
        res.status(404).send('QR Code não disponível');
    }
});

app.post('/send-message', async (req, res) => {
    const { numbers, message } = req.body;

    try {
        for (let number of numbers) {
            const formattedNumber = number.startsWith('55') ? number : `55${number}`;
            const chatId = `${formattedNumber}@c.us`;

            await client.sendMessage(chatId, message);
            console.log(`Mensagem enviada para ${formattedNumber}`);
            await delay(6000);
        }
        res.status(200).send('Envio concluído');
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).send('Erro ao enviar mensagem.');
    }
});

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

client.initialize();

// Altere o servidor para escutar no IP '0.0.0.0' para disponibilizá-lo na rede
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na rede no IP 172.16.0.26 e porta ${PORT}`);
});
