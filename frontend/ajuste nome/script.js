document.getElementById('generateButton').addEventListener('click', () => {
    // Captura os valores do formulário
    const nomeDisciplina = document.getElementById('nomeDisciplina').value;
    const dataAbertura = document.getElementById('dataAbertura').value;
    const dataEncerramento = document.getElementById('dataEncerramento').value;

    // Define o modelo da mensagem
    const mensagemModelo = `Olá, alunos da disciplina {{nome_disciplina}}!
    
  Informamos que o período da disciplina será do dia {{data_abertura}} até o dia {{data_encerramento}}.
  
  Qualquer dúvida, estamos à disposição.`;

    // Substitui as variáveis pelos valores preenchidos
    const mensagemGerada = mensagemModelo
        .replace('{{nome_disciplina}}', nomeDisciplina)
        .replace('{{data_abertura}}', dataAbertura)
        .replace('{{data_encerramento}}', dataEncerramento);

    // Exibe a mensagem gerada no campo de texto
    document.getElementById('generatedMessage').value = mensagemGerada;
});
