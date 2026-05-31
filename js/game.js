/**
 * game.js - logica do jogo sem camera
 */

import { imagens } from "./data.js";
import {
  mostrarImagem,
  mostrarFeedback,
  limparFeedback,
  mostrarTela,
  atualizarScoreTrack,
  mostrarResultadoFinal
} from "./ui.js";
import { gerarFeedbackIA, analisarImagemErro } from "./ai.js";

const TOTAL_IMAGENS_POR_JOGO = 10;

let jogoImagens  = [];
let imagemAtual  = 0;
let score        = 0;
let historico    = [];
let jogoAtivo    = false;
let respondendo  = false;

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
  lista.forEach(({ src }) => { const img = new Image(); img.src = src; });
}

// API publica

export function comecarJogo() {
  if (jogoAtivo) return;

  imagemAtual = 0;
  score       = 0;
  historico   = [];
  respondendo = false;
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
}

export function verificar(resposta) {
  if (!jogoAtivo || respondendo) return;
  respondendo = true;

  // Desabilita botoes imediatamente
  const btnReal = document.getElementById("btn-real");
  const btnFake = document.getElementById("btn-fake");
  const btnCont = document.getElementById("btn-continuar");
  if (btnReal) btnReal.disabled = true;
  if (btnFake) btnFake.disabled = true;

  const imagemObj = jogoImagens[imagemAtual];
  const acertou   = resposta === imagemObj.tipo;

  historico.push(acertou);
  if (acertou) score++;

  mostrarFeedback(
    acertou ? "Correto!" : "Errado!",
    acertou ? "correto"  : "errado",
    imagemObj.tipo
  );

  if (!acertou) {
    analisarImagemErro(
      imagemObj.src,
      imagemObj.tipo,
      imagemObj.dica || "Observe os detalhes de textura e iluminacao."
    );
  }

  atualizarScoreTrack(historico, TOTAL_IMAGENS_POR_JOGO);
  if (btnCont) btnCont.classList.add("vis");
}

export function continuar() {
  imagemAtual++;
  respondendo = false;
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
  jogoAtivo   = false;
  respondendo = false;
  mostrarTela("tela-inicial");
}

// Privado

function _finalizarJogo() {
  jogoAtivo = false;
  mostrarTela("tela-final");
  mostrarResultadoFinal(score, TOTAL_IMAGENS_POR_JOGO, historico);
  gerarFeedbackIA(score, TOTAL_IMAGENS_POR_JOGO);
}
