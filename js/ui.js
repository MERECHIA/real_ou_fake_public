/**
 * ui.js - manipulacao de DOM pura
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
      console.error(`[ui] Imagem nao encontrada: ${imagens[index].src}`);
      img.alt = "Imagem indisponivel";
      img.classList.remove("fade-out");
    };
  }, 250);

  _limparOverlay();
  _limparDicaRodape();
  _atualizarContador(index, imagens.length);
}

function _atualizarContador(index, total) {
  const el = document.getElementById("img-contador");
  if (el) el.textContent = `Imagem ${index + 1} / ${total}`;
}

// Feedback

/**
 * @param {string} texto       - "Correto!" | "Errado!"
 * @param {string} tipo        - "correto" | "errado"
 * @param {string} tipoCorreto - "real" | "fake" (resposta certa da imagem)
 */
export function mostrarFeedback(texto, tipo, tipoCorreto = null) {
  const result  = document.getElementById("result");
  const overlay = document.getElementById("feedback-overlay");
  const icone   = document.getElementById("fov-icone");
  const word    = document.getElementById("fov-word");
  const dicaFov = document.getElementById("fov-dica");

  // Resultado no rodape — maior e estilizado
  if (result) {
    result.textContent = tipo === "correto" ? "CORRETO!" : "ERRADO!";
    result.className   = `res-txt ${tipo}`;
  }

  // Overlay sobre a imagem — so icone e palavra, sem dica
  if (overlay && icone && word) {
    overlay.className = "fov";
    overlay.offsetWidth;
    overlay.classList.add("show", tipo === "correto" ? "correto" : "errado");
    icone.textContent = tipo === "correto" ? "V" : "X";

    const label = tipoCorreto === "real" ? "Real" : tipoCorreto === "fake" ? "Fake" : "";
    word.textContent  = tipo === "correto" ? "Correto" : `Era ${label}`;
  }

  // Esconde a zona de dica do overlay — nao usada mais
  if (dicaFov) dicaFov.classList.remove("show");

  // Se errou: prepara dica no rodape com "Analisando..."
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

/**
 * Atualiza o texto da dica no rodape com a resposta da IA.
 */
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

// Camera hero

export function atualizarStatusCamera(detectado, texto) {
  const label     = document.getElementById("status-camera-label");
  const topBar    = document.getElementById("cam-top-bar");
  const bottomLbl = document.getElementById("cam-bottom-label");
  const liveTxt   = document.getElementById("live-txt");

  if (label)     { label.textContent = texto; label.classList.toggle("on", detectado); }
  if (topBar)    topBar.classList.toggle("on", detectado);
  if (bottomLbl) { bottomLbl.textContent = texto; bottomLbl.classList.toggle("on", detectado); }
  if (liveTxt)   liveTxt.textContent = detectado ? "Ao vivo" : "Camera";
}

export function mostrarProgressoInicio(duracao) {
  const fill = document.getElementById("progress-bar");
  if (!fill) return;
  fill.style.transition = "none";
  fill.style.width = "0%";
  fill.offsetWidth;
  fill.style.transition = `width ${duracao}ms linear`;
  fill.style.width = "100%";
}

export function esconderProgressoInicio() {
  const fill = document.getElementById("progress-bar");
  if (!fill) return;
  fill.style.transition = "none";
  fill.style.width = "0%";
}