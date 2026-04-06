//imagens

const imagens = [
    {src: "img/lontra.jpg", tipo: "real"},
    {src: "img/IALontra.png", tipo: "fake"},
]



//estado do jogo
const img=document.getElementById("#imagem img");
const resultado=document.getElementById("resultado");
const contador=document.getElementById("contador");

let imagemAtual = 0;
let score = 0;

//funções
function mostrarImagem() {
    const imagem = imagens[imagemAtual];
    img.src = imagem.src;
    resultado.textContent = "";
}

//inicialização 

mostrarImagem();


