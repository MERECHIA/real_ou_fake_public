

import { imagens } from "./data.js";
import {
  mostrarImagem,
  mostrarFeedback,
  limparFeedback,
  mostrarTela,
  atualizarScoreTrack,
  mostrarResultadoFinal
} from "./ui.js";
import { gerarFeedbackIA } from "./ai.js";
import {
  iniciarCameraAuto,
  marcarJogoIniciado,
  aguardarReinicioAutomatico,
  pausarDeteccao
} from "./camera.js";

// Configuração

const TOTAL_IMAGENS_POR_JOGO = 5;

const DELAY_REATIVACAO = 3000;

// Estado

let jogoImagens = [];
let imagemAtual = 0;
let score       = 0;
let historico   = [];
let jogoAtivo   = false;

// Helpers

function embaralhar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function criarBaralho() {
  return embaralhar(imagens).slice(0, Math.min(TOTAL_IMAGENS_POR_JOGO, imagens.length));
}

function precarregarImagens(lista) {
  lista.forEach(({ src }) => {
    const img = new Image();
    img.src = src;
  });
}

// API pública

export function comecarJogo() {
  if (jogoAtivo) return;

  imagemAtual = 0;
  score       = 0;
  historico   = [];
  jogoImagens = criarBaralho();
  jogoAtivo   = true;

  precarregarImagens(jogoImagens);
  atualizarScoreTrack(historico, TOTAL_IMAGENS_POR_JOGO);
  mostrarTela("tela-jogo");
  mostrarImagem(imagemAtual, jogoImagens);
  limparFeedback();

  const btnCont = document.getElementById("btn-continuar");
  const btnReal = document.getElementById("btn-real");
  const btnFake = document.getElementById("btn-fake");
  if (btnCont) btnCont.classList.remove("vis");
  if (btnReal) btnReal.disabled = false;
  if (btnFake) btnFake.disabled = false;

  marcarJogoIniciado();
}

export function verificar(resposta) {
  if (!jogoAtivo) return;

  const imagemAtualObj = jogoImagens[imagemAtual];
  const correto        = imagemAtualObj.tipo;
  const acertou        = resposta === correto;

  historico.push(acertou);
  if (acertou) score++;

  const dica = !acertou ? (imagemAtualObj.dica || null) : null;

  mostrarFeedback(
    acertou ? "Correto!" : "Errado!",
    acertou ? "correto" : "errado",
    dica
  );

  atualizarScoreTrack(historico, TOTAL_IMAGENS_POR_JOGO);

  const btnReal = document.getElementById("btn-real");
  const btnFake = document.getElementById("btn-fake");
  const btnCont = document.getElementById("btn-continuar");
  if (btnReal) btnReal.disabled = true;
  if (btnFake) btnFake.disabled = true;
  if (btnCont) btnCont.classList.add("vis");
}

export function continuar() {
  imagemAtual++;
  limparFeedback();

  const btnCont = document.getElementById("btn-continuar");
  const btnReal = document.getElementById("btn-real");
  const btnFake = document.getElementById("btn-fake");
  if (btnCont) btnCont.classList.remove("vis");
  if (btnReal) btnReal.disabled = false;
  if (btnFake) btnFake.disabled = false;

  if (imagemAtual < jogoImagens.length) {
    mostrarImagem(imagemAtual, jogoImagens);
  } else {
    _finalizarJogo();
  }
}

export function reiniciarJogo() {
  jogoAtivo = false;

  pausarDeteccao();

  mostrarTela("tela-inicial");

  setTimeout(() => {
    iniciarCameraAuto(comecarJogo, reiniciarJogo);
  }, DELAY_REATIVACAO);
}

// Privado

function _finalizarJogo() {
  jogoAtivo = false;
  mostrarTela("tela-final");
  mostrarResultadoFinal(score, TOTAL_IMAGENS_POR_JOGO, historico);
  gerarFeedbackIA(score, TOTAL_IMAGENS_POR_JOGO);

  setTimeout(() => {
    aguardarReinicioAutomatico(reiniciarJogo);
  }, 3000);
}
