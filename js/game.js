import { imagens } from "./data.js";   
import { mostrarImagem, mostrarFeedback, limparFeedback, mostrarTela} from "./ui.js";
import { gerarFeedbackIA } from "./ai.js";
import { iniciarCameraAuto, pararDeteccao } from "./camera.js";

const TOTAL_IMAGENS_POR_JOGO = 5;
let jogoImagens = [];
let imagemAtual = 0;
let score = 0;

function embaralhar(array) {
    const copia = array.slice();
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function criarBaralho() {
    const imagensEmbaralhadas = embaralhar(imagens);
    return imagensEmbaralhadas.slice(0, Math.min(TOTAL_IMAGENS_POR_JOGO, imagensEmbaralhadas.length));
}


export function comecarJogo() {
    imagemAtual = 0;
    score = 0;
    jogoImagens = criarBaralho();
    mostrarTela("tela-jogo");
    mostrarImagem(imagemAtual, jogoImagens);
    document.getElementById("btn-continuar").style.display = "none";
    limparFeedback(); 
}

export function verificar(resposta) {
    const correto = jogoImagens[imagemAtual].tipo;  
    if (resposta === correto) {
        mostrarFeedback("Correto!", "green");
        score++;
    } else {
        mostrarFeedback("Errado!", "red");
    }  
    
    document.getElementById("real").disabled = true;
    document.getElementById("fake").disabled = true;

    document.getElementById("btn-continuar").style.display = "block";
}

export function continuar() {
    imagemAtual++;
    document.getElementById("real").disabled = false;
    document.getElementById("fake").disabled = false;
    if (imagemAtual < jogoImagens.length) {
        mostrarImagem(imagemAtual, jogoImagens);
        limparFeedback();
        document.getElementById("btn-continuar").style.display = "none";
    } else {
        finalizarJogo();
    }
}

function finalizarJogo() {
    mostrarTela("tela-final");
    document.getElementById("resultado-final").textContent = "Você acertou " + score + " / " + "5";
    gerarFeedbackIA(score, 5);
    setTimeout(() => {
        reiniciarJogo();
    }, 5000);

}

export function reiniciarJogo() {
    pararDeteccao();
    mostrarTela("tela-inicial");
    iniciarCameraAuto(comecarJogo, reiniciarJogo);
}