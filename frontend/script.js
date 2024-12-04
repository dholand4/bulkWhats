const BASE_URL = 'http://172.16.0.26:3000';

async function authenticateWithMatricula() {
    const matricula = document.getElementById('matricula').value.trim();
    const statusElement = document.getElementById('qrStatus');

    if (!matricula) {
        statusElement.textContent = "Por favor, insira a matrícula.";
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ matricula }),
        });

        if (response.ok) {
            statusElement.textContent = `Autenticação iniciada para matrícula: ${matricula}`;
            generateQRCode(matricula);
        } else {
            const data = await response.json();
            statusElement.textContent = `Erro: ${data.message}`;
        }
    } catch (error) {
        console.error('Erro ao autenticar:', error);
        statusElement.textContent = 'Erro ao conectar ao servidor.';
    }
}

async function generateQRCode(matricula) {
    const qrCodeImage = document.getElementById('qrCode');
    const statusElement = document.getElementById('qrStatus');
    const clearAuthButton = document.getElementById('clearAuthButton');

    try {
        const response = await fetch(`${BASE_URL}/get-qr/${matricula}`);

        if (response.ok) {
            const data = await response.json();

            if (data.message === 'Já autenticado') {
                statusElement.textContent = 'Você já foi autenticado!';
                qrCodeImage.style.display = 'none';
                clearAuthButton.style.display = 'none';
                return;
            }

            if (data.qrCode) {
                qrCodeImage.src = data.qrCode;
                qrCodeImage.style.display = 'block';
                statusElement.textContent = 'Escaneie o QR Code para autenticar.';
                clearAuthButton.style.display = 'inline-block';
            }

        } else {
            statusElement.textContent = 'Autenticando aguarde alguns segundos e tenta novamente.';
            qrCodeImage.style.display = 'none';
            clearAuthButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao obter QR Code:', error);
        statusElement.textContent = 'Erro ao conectar ao servidor.';
        qrCodeImage.style.display = 'none';
        clearAuthButton.style.display = 'none';
    }
}

function clearAuthentication() {
    const qrCodeImage = document.getElementById('qrCode');
    const statusElement = document.getElementById('qrStatus');
    const clearAuthButton = document.getElementById('clearAuthButton');

    qrCodeImage.style.display = 'none';
    clearAuthButton.style.display = 'none';
    statusElement.textContent = 'Autenticação limpa. Insira a matrícula novamente.';
}

async function sendMessage() {
    const matricula = document.getElementById('matricula').value.trim();
    const numbersField = document.getElementById('numbers');
    const rawNumbers = numbersField.value.trim();
    const messageTemplate = document.getElementById('message').value.trim();
    const statusElement = document.getElementById('status');

    if (!matricula) {
        statusElement.textContent = "Por favor, insira sua matrícula.";
        return;
    }

    if (!rawNumbers || !messageTemplate) {
        statusElement.textContent = "Por favor, insira números e uma mensagem.";
        return;
    }

    const recipients = rawNumbers.split(',').map(entry => {
        const [name, number] = entry.split(':').map(item => item.trim());
        return { name: name || 'Usuário', number };
    });

    let successCount = 0;
    let errorCount = 0;

    statusElement.textContent = "Iniciando envio de mensagens...";

    try {
        for (const { name, number } of recipients) {
            const personalizedMessage = messageTemplate.replace(/{nome}/g, name);

            try {
                const response = await fetch(`${BASE_URL}/send-message`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ matricula, recipients: [{ name, number }], messageTemplate: personalizedMessage }), // Corrigir o formato
                });

                if (response.ok) {
                    successCount++;
                    statusElement.textContent = `Mensagem enviada para ${name || number}.`;
                } else {
                    const data = await response.json();
                    errorCount++;
                    console.error(`Erro ao enviar para ${name || number}: ${data.message}`);
                    statusElement.textContent = `Erro ao enviar para ${name || number}: ${data.message}`;
                }
            } catch (error) {
                errorCount++;
                console.error(`Erro ao enviar para ${name || number}:`, error);
                statusElement.textContent = `Erro ao conectar ao servidor ao enviar para ${name || number}.`;
            }

            await new Promise(resolve => setTimeout(resolve, 6000)); // 6 segundos
        }

        if (successCount > 0 && errorCount === 0) {
            statusElement.textContent = "Envio concluído para todos os destinatários!";
        } else if (successCount > 0) {
            statusElement.textContent = `Envio concluído com ${successCount} sucesso(s) e ${errorCount} erro(s).`;
        } else {
            statusElement.textContent = "Falha ao enviar mensagens para todos os destinatários.";
        }
    } catch (error) {
        console.error('Erro no envio geral:', error);
        statusElement.textContent = 'Erro inesperado ao conectar ao servidor.';
    }
}

document.getElementById('clearAuthButton').addEventListener('click', clearAuthentication);
