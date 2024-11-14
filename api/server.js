const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const path = require('path'); // Módulo para manipular caminhos

const app = express();
const PORT = process.env.PORT; // Configuração da porta para o Heroku

app.use(cors({ origin: '*' })); // Permite acesso de qualquer origem
app.use(express.json());

// Rota raiz para garantir que o servidor esteja funcionando
app.get('/', (req, res) => {
    res.send('API está funcionando!');
});

let qrCodeData = ''; // Variável para armazenar o QR code
let isAuthenticated = false; // Variável para indicar se o cliente está autenticado

// Substitua 'userId' pelo identificador exclusivo de cada usuário
const userId = 'unique_user_id'; // Exemplo: isso poderia ser dinâmico para cada usuário

// Configuração do cliente WhatsApp com autenticação local
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: userId, // Define uma pasta única para cada usuário
        dataPath: path.resolve(__dirname, `./whatsapp_auth_data/${userId}`), // Caminho absoluto para autenticação
    }),
});

client.on('qr', (qr) => {
    if (!isAuthenticated) { // Só gera o QR code se não estiver autenticado
        qrcode.toDataURL(qr, (err, url) => {
            if (err) {
                console.error('Erro ao gerar QR Code:', err);
                return;
            }
            qrCodeData = url; // Armazena o QR code na variável
        });
    }
});

client.on('ready', () => {
    isAuthenticated = true;
    qrCodeData = ''; // Limpa o QR code armazenado após autenticação
    console.log('Cliente do WhatsApp está pronto!');
});

// Endpoint para enviar o QR code ao front-end
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

            // Envia a mensagem
            await client.sendMessage(chatId, message);
            console.log(`Mensagem enviada para ${formattedNumber}`);

            // Aguarda 6 segundos antes de enviar para o próximo número
            await delay(6000);
        }
        res.status(200).send('Envio concluído');
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).send('Erro ao enviar mensagem.');
    }
});

// Função para criar um atraso
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

client.initialize();

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
