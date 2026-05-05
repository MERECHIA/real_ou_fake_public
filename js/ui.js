

export function mostrarImagem(index, imagens) {
  const img = document.getElementById("imagem-principal");
  if (!img) return;

  img.classList.add("fade-out");

  setTimeout(() => {
    img.src = imagens[index].src;
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
 * @param {string} texto   - "Correto!" ou "Errado!"
 * @param {string} tipo    - "correto" | "errado"
 * @param {string} [dica]  - dica da imagem, exibida apenas quando errado
 */
export function mostrarFeedback(texto, tipo, dica = null) {
  const result  = document.getElementById("result");
  const dicaEl  = document.getElementById("dica-imagem");
  const overlay = document.getElementById("feedback-overlay");
  const icone   = document.getElementById("fov-icone");
  const word    = document.getElementById("fov-word");

  if (result) {
    result.textContent = texto;
    result.style.color = tipo === "correto"
      ? "var(--verde-escuro)"
      : "var(--vermelho-esc)";
  }

  // Dica: só aparece quando erra e existe dica definida
  if (dicaEl) {
    if (tipo === "errado" && dica) {
      dicaEl.textContent = `💡 ${dica}`;
      dicaEl.classList.add("vis");
    } else {
      dicaEl.textContent = "";
      dicaEl.classList.remove("vis");
    }
  }

  if (overlay && icone && word) {
    overlay.className = "fov";
    overlay.offsetWidth; // força reflow
    overlay.classList.add("show", tipo === "correto" ? "correto" : "errado");
    icone.textContent = tipo === "correto" ? "✓" : "✕";
    word.textContent  = tipo === "correto" ? "Correto" : "Errado";
  }
}

export function limparFeedback() {
  const result  = document.getElementById("result");
  const dicaEl  = document.getElementById("dica-imagem");

  if (result) {
    result.textContent = "";
    result.style.color = "";
  }

  if (dicaEl) {
    dicaEl.textContent = "";
    dicaEl.classList.remove("vis");
  }

  _limparOverlay();
}

function _limparOverlay() {
  const overlay = document.getElementById("feedback-overlay");
  const icone   = document.getElementById("fov-icone");
  const word    = document.getElementById("fov-word");
  if (overlay) overlay.className = "fov";
  if (icone)   icone.textContent = "";
  if (word)    word.textContent  = "";
}

// Troca de telas

export function mostrarTela(telaId) {
  const telas = ["tela-inicial", "tela-jogo", "tela-final"];

  telas.forEach(id => {
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
  if (scoreEl) {
    scoreEl.innerHTML = `${score} <span class="final-den">/ ${total}</span>`;
  }

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
    feedbackEl.innerHTML = `
      <span class="typing-dots">
        <span></span><span></span><span></span>
      </span>`;
  }
}

// Helpers de câmera
export function atualizarStatusCamera(detectado, texto) {
  const label = document.getElementById("status-camera-label");
  const dot   = document.getElementById("live-dot");
  const ltxt  = document.getElementById("live-txt");

  if (label) {
    label.textContent = texto;
    label.classList.toggle("on", detectado);
  }

  if (dot)  dot.classList.toggle("on", detectado);
  if (ltxt) ltxt.textContent = detectado ? "Ao vivo" : "Câmera";
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
