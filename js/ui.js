/**
 * ui.js — manipulação de DOM pura
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
      console.error(`[ui] Imagem não encontrada: ${imagens[index].src}`);
      img.alt = "Imagem indisponível";
      img.classList.remove("fade-out");
    };
  }, 250);

  _limparOverlay();
  _atualizarContador(index, imagens.length);
}

function _atualizarContador(index, total) {
  const el = document.getElementById("img-contador");
  if (el) el.textContent = `Imagem ${index + 1} / ${total}`;
}

// Feedback 

/**
 * Exibe o overlay de feedback sobre a imagem.
 * Quando errado, a zona de dica fica pronta para receber o texto da IA.
 *
 * @param {string} texto  - "Correto!" | "Errado!"
 * @param {string} tipo   - "correto" | "errado"
 * @param {string} tipoCorreto - "real" | "fake"
 */
export function mostrarFeedback(texto, tipo, tipoCorreto = null) {
  const result  = document.getElementById("result");
  const overlay = document.getElementById("feedback-overlay");
  const icone   = document.getElementById("fov-icone");
  const word    = document.getElementById("fov-word");
  const dica    = document.getElementById("fov-dica");
  const dicaTxt = document.getElementById("fov-dica-txt");
  const label = tipoCorreto === "real" ? "Real" : "Fake";
  

  if (result) {
    result.textContent = texto;
    result.style.color = tipo === "correto"
      ? "var(--verde-escuro)"
      : "var(--vermelho-esc)";
  }

  if (overlay && icone && word) {
    overlay.className = "fov";
    overlay.offsetWidth; 
    overlay.classList.add("show", tipo === "correto" ? "correto" : "errado");
    icone.textContent = tipo === "correto" ? "✓" : "✕";
    word.textContent = tipo === "correto" ? "Correto" : `Errado — era ${label}`;
  }

  // Dica: só prepara zona quando erra — conteúdo vem depois via atualizarDicaIA
  if (dica && dicaTxt) {
    if (tipo === "errado") {
      dicaTxt.textContent = "Analisando imagem...";
      dicaTxt.classList.add("loading");
      // Desliza de baixo após o overlay aparecer
      setTimeout(() => dica.classList.add("show"), 150);
    } else {
      dica.classList.remove("show");
      dicaTxt.textContent = "";
    }
  }
}

/**
 * Atualiza o texto da dica com a resposta da IA.
 * Chamado quando a API retorna (ou timeout/fallback).
 *
 * @param {string} texto - explicação gerada pela IA
 */
export function atualizarDicaIA(texto) {
  const dicaTxt = document.getElementById("fov-dica-txt");
  if (!dicaTxt) return;

  dicaTxt.classList.remove("loading");
  dicaTxt.textContent = texto;
}

export function limparFeedback() {
  const result = document.getElementById("result");
  if (result) { result.textContent = ""; result.style.color = ""; }
  _limparOverlay();
}

function _limparOverlay() {
  const overlay = document.getElementById("feedback-overlay");
  const icone   = document.getElementById("fov-icone");
  const word    = document.getElementById("fov-word");
  const dica    = document.getElementById("fov-dica");
  const dicaTxt = document.getElementById("fov-dica-txt");

  if (overlay) overlay.className = "fov";
  if (icone)   icone.textContent  = "";
  if (word)    word.textContent   = "";
  if (dica)    dica.classList.remove("show");
  if (dicaTxt) { dicaTxt.textContent = ""; dicaTxt.classList.remove("loading"); }
}

function _labelTipo(tipo) {
  return tipo === "errado" ? "" : (tipo === "real" ? "Real" : "Fake");
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
      item.textContent = acertou ? "✓" : "✕";
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

// Câmera hero (tela inicial) 

export function atualizarStatusCamera(detectado, texto) {
  const label    = document.getElementById("status-camera-label");
  const topBar   = document.getElementById("cam-top-bar");
  const bottomLbl = document.getElementById("cam-bottom-label");
  const liveTxt  = document.getElementById("live-txt");

  if (label) {
    label.textContent = texto;
    label.classList.toggle("on", detectado);
  }

  if (topBar)    topBar.classList.toggle("on", detectado);
  if (bottomLbl) {
    bottomLbl.textContent = texto;
    bottomLbl.classList.toggle("on", detectado);
  }
  if (liveTxt) liveTxt.textContent = detectado ? "Ao vivo" : "Câmera";
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