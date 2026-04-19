import { imagens } from "./data.js";   
import { mostrarImagem, mostrarFeedback, limparFeedback, mostrarTela} from "./ui.js";
import { gerarFeedbackIA } from "./ai.js";
import { iniciarCameraAuto, pararDeteccao } from "./camera.js";


//estado do jogo

let imagemAtual = 0;
let score = 0;

//funções
export function comecarJogo() {
    imagemAtual = 0;
    score = 0;
    mostrarTela("tela-jogo");
    mostrarImagem(imagemAtual, imagens);
    document.getElementById("btn-continuar").style.display = "none";
    limparFeedback(); 
}

export function verificar(resposta) {
    const correto = imagens[imagemAtual].tipo;  
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
    if (imagemAtual < imagens.length) {
        mostrarImagem(imagemAtual, imagens);
        limparFeedback();
        document.getElementById("btn-continuar").style.display = "none";
    } else {
        finalizarJogo();
    }
}

function finalizarJogo() {
    mostrarTela("tela-final");
    document.getElementById("resultado-final").textContent = "Você acertou " + score + " /" + imagens.length;
    gerarFeedbackIA(score, imagens.length);
    setTimeout(() => {
        reiniciarJogo();
    }, 5000);

}

export function reiniciarJogo() {
    pararDeteccao(); // Reset do estado de detecção
    mostrarTela("tela-inicial");
    iniciarCameraAuto(comecarJogo, reiniciarJogo);
}