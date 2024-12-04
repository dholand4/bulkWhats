const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');


const matriculasValidas = require('./matriculas.json').validas;


const app = express();
const PORT = 3000;

app.use(cors({ origin: '*' }));
app.use(express.json());

const clients = new Map();
const qrCodes = new Map();
const authenticatedUsers = new Set();

app.get('/', (req, res) => {
    res.send('API está funcionando!');
});

function formatPhoneNumber(number) {
    // Remove quaisquer caracteres não numéricos (parênteses, traços, espaços, etc.)
    number = number.replace(/[^\d]/g, '');

    if (!/^\d+$/.test(number)) {
        throw new Error('Número inválido. Use apenas dígitos.');
    }

    if (!number.startsWith('55')) {
        number = `55${number}`; // Adiciona o código do país (Brasil)
    }

    return number.replace(/^55(\d{2})9(\d{8})$/, '55$1$2'); // Remove nono dígito após DDD
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

app.post('/authenticate', (req, res) => {
    const { matricula } = req.body;

    if (!matricula || !matriculasValidas.includes(matricula)) {
        return res.status(400).send('Matrícula inválida');
    }

    const dataPath = path.resolve(__dirname, `./whatsapp_auth_data/${matricula}`);

    if (!fs.existsSync(dataPath)) {
        fs.mkdirSync(dataPath, { recursive: true });
    }

    if (clients.has(matricula)) {
        return res.status(200).send('Cliente já autenticado ou em processo de autenticação');
    }

    const client = new Client({
        authStrategy: new LocalAuth({
            clientId: matricula,
            dataPath: dataPath,
        }),
    });

    clients.set(matricula, client);

    client.on('qr', (qr) => {
        qrcode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error('Erro ao gerar QR Code:', err);
                return;
            }
            qrCodes.set(matricula, url);
        });
    });

    client.on('ready', () => {
        authenticatedUsers.add(matricula);
        qrCodes.delete(matricula);
        console.log(`Cliente do WhatsApp para matrícula ${matricula} está pronto!`);
    });

    client.on('auth_failure', () => {
        clients.delete(matricula);
        authenticatedUsers.delete(matricula);
        console.error(`Falha de autenticação para matrícula ${matricula}`);
    });

    client.on('disconnected', (reason) => {
        clients.delete(matricula);
        authenticatedUsers.delete(matricula);
        console.log(`Cliente do WhatsApp desconectado (${reason}) para matrícula ${matricula}`);
    });

    client.initialize();
    res.status(200).send('Cliente inicializado. Aguarde o QR Code.');
});

app.get('/get-qr/:matricula', (req, res) => {
    const { matricula } = req.params;

    if (!clients.has(matricula)) {
        return res.status(404).send('Cliente não encontrado');
    }

    if (authenticatedUsers.has(matricula)) {
        res.status(200).json({ message: 'Já autenticado' });
    } else if (qrCodes.has(matricula)) {
        res.status(200).json({ qrCode: qrCodes.get(matricula) });
    } else {
        res.status(404).send('QR Code não disponível');
    }
});

app.post('/send-message', async (req, res) => {
    const { matricula, recipients, messageTemplate } = req.body;

    if (!clients.has(matricula)) {
        return res.status(400).send('Cliente não autenticado ou não inicializado');
    }

    const client = clients.get(matricula);

    try {
        for (let recipient of recipients) {
            const formattedNumber = formatPhoneNumber(recipient.number);
            const chatId = `${formattedNumber}@c.us`;

            const personalizedMessage = messageTemplate.replace('{name}', recipient.name);

            await client.sendMessage(chatId, personalizedMessage);
            console.log(`Mensagem enviada para ${recipient.name} (${formattedNumber})`);
        }
        res.status(200).send('Envio concluído');
    } catch (error) {
        recipients.forEach((recipient) => {
            console.error(`Erro ao enviar mensagem para ${recipient.name}:`, error);
        });
        res.status(500).send('Erro ao enviar mensagem.');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na rede no IP 172.16.0.26 e porta ${PORT}`);
});
