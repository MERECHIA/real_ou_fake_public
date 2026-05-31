/**
 * ui.js
 */

// Imagem

export function mostrarImagem(index, imagens) {
  const img = document.getElementById("imagem-principal");
  if (!img) return;

  img.classList.add("fade-out");

  setTimeout(() => {
    img.src    = imagens[index].src;
    img.onload  = () => img.classList.remove("fade-out");
    img.onerror = () => {
      img.alt = "Imagem indisponivel";
      img.classList.remove("fade-out");
    };
  }, 250);

  _limparOverlay();
  _limparDicaRodape();

  const el = document.getElementById("img-contador");
  if (el) el.textContent = `Imagem ${index + 1} / ${imagens.length}`;
}

// Feedback

export function mostrarFeedback(texto, tipo, tipoCorreto = null) {
  const result  = document.getElementById("result");
  const overlay = document.getElementById("feedback-overlay");
  const icone   = document.getElementById("fov-icone");
  const word    = document.getElementById("fov-word");
  const dicaFov = document.getElementById("fov-dica");

  if (result) {
    result.textContent = tipo === "correto" ? "CORRETO!" : "ERRADO!";
    result.className   = `res-txt ${tipo}`;
  }

  if (overlay && icone && word) {
    overlay.className = "fov";
    overlay.offsetWidth;
    overlay.classList.add("show", tipo === "correto" ? "correto" : "errado");
    icone.textContent = tipo === "correto" ? "V" : "X";
    const label = tipoCorreto === "real" ? "Real" : tipoCorreto === "fake" ? "Fake" : "";
    word.textContent = tipo === "correto" ? "Correto" : `Era ${label}`;
  }

  if (dicaFov) dicaFov.classList.remove("show");

  if (tipo === "errado") {
    const rodape    = document.getElementById("dica-rodape");
    const rodapeTxt = document.getElementById("dica-rodape-txt");
    if (rodape && rodapeTxt) {
      rodapeTxt.textContent = "Analisando imagem...";
      rodapeTxt.classList.add("loading");
      rodape.classList.add("vis");
    }
  }
}

export function atualizarDicaIA(texto) {
  const rodapeTxt = document.getElementById("dica-rodape-txt");
  if (!rodapeTxt) return;
  rodapeTxt.classList.remove("loading");
  rodapeTxt.textContent = texto;
}

export function limparFeedback() {
  const result = document.getElementById("result");
  if (result) { result.textContent = ""; result.className = "res-txt"; }
  _limparOverlay();
  _limparDicaRodape();
}

function _limparOverlay() {
  const overlay = document.getElementById("feedback-overlay");
  const icone   = document.getElementById("fov-icone");
  const word    = document.getElementById("fov-word");
  const dicaFov = document.getElementById("fov-dica");
  if (overlay) overlay.className = "fov";
  if (icone)   icone.textContent  = "";
  if (word)    word.textContent   = "";
  if (dicaFov) dicaFov.classList.remove("show");
}

function _limparDicaRodape() {
  const rodape    = document.getElementById("dica-rodape");
  const rodapeTxt = document.getElementById("dica-rodape-txt");
  if (rodape)    rodape.classList.remove("vis");
  if (rodapeTxt) { rodapeTxt.textContent = ""; rodapeTxt.classList.remove("loading"); }
}

// Troca de telas

export function mostrarTela(telaId) {
  ["tela-inicial", "tela-jogo", "tela-final"].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("ativa");
    el.classList.add("escondida");
  });

  const alvo = document.getElementById(telaId);
  if (!alvo) return;
  alvo.classList.remove("escondida");
  requestAnimationFrame(() => {
    requestAnimationFrame(() => alvo.classList.add("ativa"));
  });
}

// Score track

export function atualizarScoreTrack(historico, total) {
  const track = document.getElementById("score-track");
  if (!track) return;

  track.innerHTML = "";
  for (let i = 0; i < total; i++) {
    const dot = document.createElement("div");
    dot.className = "score-dot";
    if (i < historico.length) {
      dot.classList.add(historico[i] ? "ok" : "er");
    } else if (i === historico.length) {
      dot.classList.add("at");
    }
    track.appendChild(dot);
  }
}

// Tela final

export function mostrarResultadoFinal(score, total, historico) {
  const scoreEl = document.getElementById("resultado-final");
  if (scoreEl) scoreEl.innerHTML = `${score} <span class="final-den">/ ${total}</span>`;

  const ghostEl = document.getElementById("final-ghost");
  if (ghostEl) ghostEl.textContent = score;

  const barraEl = document.getElementById("resultado-barra");
  if (barraEl) {
    barraEl.innerHTML = "";
    historico.forEach(acertou => {
      const item = document.createElement("div");
      item.className = `b-item ${acertou ? "ok" : "er"}`;
      item.textContent = acertou ? "V" : "X";
      barraEl.appendChild(item);
    });
  }

  const feedbackEl = document.getElementById("feedback-ia");
  if (feedbackEl) {
    feedbackEl.innerHTML = `<span class="typing-dots">
      <span></span><span></span><span></span>
    </span>`;
  }
}
