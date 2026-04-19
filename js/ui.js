export function mostrarImagem(imagemAtual, imagens) {
    const img=document.querySelector("#imagem img");
    img.classList.add("fade-out");

    setTimeout(() => {
        img.src = imagens[imagemAtual].src;
        img.classList.remove("fade-out");
    }
    , 200);
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
    const telas=["tela-inicial", "tela-jogo", "tela-final"];

    telas.forEach(id => {
        const n=document.getElementById(id);
        if (n) {
            n.classList.add("escondido");
            n.classList.remove("ativa");
        }
    });

    const ativa=document.getElementById(tela);

    if (ativa) {
        ativa.classList.remove("escondido");

        setTimeout(() => {
            ativa.classList.add("ativa");
        }, 10);
    }

}