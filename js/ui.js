export function mostrarImagem(imagemAtual, imagens) {
    const img=document.querySelector("#imagem img");
    img.src = imagens[imagemAtual].src;
}

export function mostrarFeedback(texto, cor) {
    const resultado=document.getElementById("result");
    resultado.textContent = texto;
    resultado.style.color = cor;
}

export function limparFeedback() {
    const resultado=document.getElementById("result");
    resultado.textContent = "";
}

export function mostrarTela(tela) {
    document.getElementById("tela-inicial").classList.add("escondido");
    document.getElementById("tela-jogo").classList.add("escondido");
    document.getElementById("tela-final").classList.add("escondido");

    document.getElementById(tela).classList.remove("escondido");
}