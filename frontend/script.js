async function generateQRCode() {
    const qrCodeImage = document.getElementById('qrCode');
    const statusElement = document.getElementById('qrStatus');
    const clearAuthButton = document.getElementById('clearAuthButton');

    try {
        const response = await fetch('https://bulkwhats.onrender.com/get-qr');
        console.log("Resposta do servidor:", response);

        if (!response.ok) {
            const data = await response.json();
            if (data.message === 'Já autenticado') {
                statusElement.textContent = 'Você já foi autenticado!';
                qrCodeImage.style.display = 'none';
            } else {
                statusElement.textContent = 'QR Code não disponível. Tente novamente.';
                qrCodeImage.style.display = 'none';
                clearAuthButton.style.display = 'none';
            }
            return;
        }

        const data = await response.json();
        if (data.qrCode) {
            qrCodeImage.src = data.qrCode;
            qrCodeImage.style.display = 'block';
            statusElement.textContent = 'Escaneie o QR Code para autenticar.';
            clearAuthButton.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao obter QR Code:', error);
        statusElement.textContent = 'Erro ao conectar ao servidor.';
        qrCodeImage.style.display = 'none';
        clearAuthButton.style.display = 'none';
    }
}

async function sendMessage() {
    const numbersField = document.getElementById('numbers');
    const numbers = numbersField.value.split(',').map(num => num.trim());
    const message = document.getElementById('message').value;
    const statusElement = document.getElementById('status');

    statusElement.textContent = "Iniciando envio de mensagens...";

    try {
        const response = await fetch('https://bulkwhats.onrender.com/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numbers, message }),
        });

        console.log("Resposta do servidor ao enviar mensagem:", response);

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
