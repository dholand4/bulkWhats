async function generateQRCode() {
    const qrCodeImage = document.getElementById('qrCode');
    const statusElement = document.getElementById('qrStatus');
    const clearAuthButton = document.getElementById('clearAuthButton');

    try {
        // Requisição para obter o QR Code
        const response = await fetch('http://localhost:3001/get-qr');

        if (!response.ok) {
            const data = await response.json();
            if (data.message === 'Já autenticado') {
                // Se já foi autenticado anteriormente
                statusElement.textContent = 'Você já foi autenticado!';
                qrCodeImage.style.display = 'none'; // Oculta o QR Code

            } else {
                statusElement.textContent = 'QR Code não disponível. Tente novamente.';
                qrCodeImage.style.display = 'none';
                clearAuthButton.style.display = 'none'; // Esconde o botão de limpar
            }
            return;
        }

        const data = await response.json();

        if (data.qrCode) {
            qrCodeImage.src = data.qrCode;
            qrCodeImage.style.display = 'block'; // Exibe o QR Code
            statusElement.textContent = 'Escaneie o QR Code para autenticar.';
            clearAuthButton.style.display = 'none'; // Esconde o botão de limpar
        }
    } catch (error) {
        console.error('Erro ao obter QR Code:', error);
        statusElement.textContent = 'Erro ao conectar ao servidor.';
        qrCodeImage.style.display = 'none';
        clearAuthButton.style.display = 'none'; // Esconde o botão de limpar
    }
}

async function clearAuth() {
    const statusElement = document.getElementById('qrStatus');
    const qrCodeImage = document.getElementById('qrCode');
    const clearAuthButton = document.getElementById('clearAuthButton');

    try {
        const response = await fetch('http://localhost:3001/clear-auth');

        if (response.ok) {
            statusElement.textContent = 'Autenticação limpa. Gere um novo QR Code.';
            qrCodeImage.style.display = 'none'; // Esconde o QR Code
            clearAuthButton.style.display = 'none'; // Esconde o botão de limpar
        } else {
            statusElement.textContent = 'Erro ao limpar autenticação.';
        }
    } catch (error) {
        console.error('Erro ao limpar autenticação:', error);
        statusElement.textContent = 'Erro ao conectar ao servidor.';
    }
}

async function sendMessage() {
    const numbersField = document.getElementById('numbers');
    const numbers = numbersField.value.split(',').map(num => num.trim());
    const message = document.getElementById('message').value;
    const statusElement = document.getElementById('status');

    statusElement.textContent = "Iniciando envio de mensagens...";

    try {
        const response = await fetch('http://localhost:3001/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ numbers, message }),
        });

        if (!response.ok) {
            statusElement.textContent = 'Erro ao enviar mensagem.';
            return;
        }

        statusElement.textContent = 'Envio concluído!';
    } catch (error) {
        console.error('Erro:', error);
        statusElement.textContent = 'Erro ao conectar ao servidor.';
    }
}

document.getElementById('numbers').addEventListener('input', function (event) {
    this.value = this.value.replace(/[^0-9,]/g, '');
});
