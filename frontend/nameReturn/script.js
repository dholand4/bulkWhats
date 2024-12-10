function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function processData() {
    const input = document.getElementById('inputData').value;
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = ''; // Limpa o resultado anterior

    if (!input.trim()) {
        alert('Por favor, insira os dados.');
        return;
    }

    // Divide os dados por linha
    const lines = input.trim().split('\n');
    const results = [];

    // Processa cada linha
    lines.forEach(line => {
        const fields = line.split('\t'); // Divide pelos tabuladores
        const fullName = fields[1]; // Nome completo está na posição 1
        const phone = fields[2] || fields[3]; // Telefone primário ou secundário

        if (fullName && phone) {
            const firstName = fullName.split(' ')[0]; // Obtém apenas o primeiro nome
            const formattedName = capitalizeFirstLetter(firstName); // Capitaliza o primeiro nome
            results.push(`${formattedName}: ${phone}`);
        }
    });

    if (results.length > 0) {
        // Junta os resultados, separando por vírgulas, exceto o último
        outputDiv.innerText = results.join(', ');
    } else {
        outputDiv.innerText = 'Nenhum dado válido encontrado.';
    }
}

function copyToClipboard() {
    const outputDiv = document.getElementById('output');
    const textToCopy = outputDiv.innerText;

    if (!textToCopy.trim()) {
        alert('Nenhum texto para copiar.');
        return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('Texto copiado para a área de transferência!');
    }).catch(err => {
        console.error('Erro ao copiar texto:', err);
        alert('Erro ao copiar texto.');
    });
}
