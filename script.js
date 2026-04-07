//imagens

const imagens = [
    {src: "img/lontra.jpg", tipo: "real"},
    {src: "img/IALontra.png", tipo: "fake"},
]

//estado do jogo

const img=document.querySelector("#imagem img");
const resultado=document.getElementById("resultado");
const contador=document.getElementById("total");

let imagemAtual = 0;
let score = 0;


//funções
function mostrarImagem() {
    const imagem = imagens[imagemAtual];
    img.src = imagem.src;
}

function verificar(resposta) {
    const correto=imagens[imagemAtual].tipo;
    if (resposta === correto) {
        document.getElementById("result").textContent = "Correto!";
        resultado.style.color = "green";
        score++;
    } else {
        document.getElementById("result").textContent = "Errado!";
        resultado.style.color = "red";
    }
    imagemAtual++;
    if (imagemAtual < imagens.length) {
        
        setTimeout(() => {
            document.getElementById("result").textContent = "";
            mostrarImagem();
        }, 2000);

    } else {
        document.getElementById("end").textContent = "Fim do jogo!";
        document.getElementById("score1").textContent = `Sua pontuação: ${score}/${imagens.length}`;
    }
} 
//inicialização 

mostrarImagem();

