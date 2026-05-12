/**
 * camera.js
 * - Inicia camera e modelo ml5 UMA VEZ
 * - Loop de deteccao via requestAnimationFrame
 * - Bounding box no canvas overlay
 * - Espelha stream para #camera-display (hero da tela inicial)
 */

import { atualizarStatusCamera, mostrarProgressoInicio, esconderProgressoInicio } from "./ui.js";

// Espelha o mesmo stream para o video visivel na tela inicial
function _espelharParaDisplay(stream) {
  const display = document.getElementById("camera-display");
  if (display && stream) {
    display.srcObject = stream;
    display.play().catch(() => {});
  }
}

// Estado
let faceapi         = null;
let modeloCarregado = false;
let cameraIniciada  = false;
let loopAtivo       = false;

let jogoEmAndamento    = false;
let aguardandoReinicio = false;
let prontoParaStart    = false;
let ausenciaInicio     = null;
let inicioTimeout      = null;

let cbStart = null;
let cbLeave = null;

const DELAY_INICIO   = 2000;
const DELAY_AUSENCIA = 3000;

// API publica

export async function iniciarCameraAuto(startCallback, leaveCallback = null) {
  cbStart = startCallback;
  cbLeave = leaveCallback;

  loopAtivo          = false;
  jogoEmAndamento    = false;
  aguardandoReinicio = false;
  prontoParaStart    = false;
  ausenciaInicio     = null;
  _limparInicioTimeout();

  atualizarStatusCamera(false, "Aguardando...");

  if (cameraIniciada) {
    loopAtivo = true;
    _loopDeteccao(document.getElementById("camera"));
    return;
  }

  await _iniciarCamera();
}

export function marcarJogoIniciado() {
  jogoEmAndamento    = true;
  aguardandoReinicio = false;
}

export function pausarDeteccao() {
  loopAtivo          = false;
  jogoEmAndamento    = false;
  aguardandoReinicio = false;
  prontoParaStart    = false;
  ausenciaInicio     = null;
  _limparInicioTimeout();
  _limparCanvas();
}

export function aguardarReinicioAutomatico(startCallback) {
  cbStart            = startCallback;
  jogoEmAndamento    = false;
  aguardandoReinicio = true;
  prontoParaStart    = false;
  ausenciaInicio     = null;
  _limparInicioTimeout();

  if (!loopAtivo) {
    loopAtivo = true;
    _loopDeteccao(document.getElementById("camera"));
  }
}

export function encerrarCamera() {
  const video = document.getElementById("camera");
  if (video && video.srcObject) {
    video.srcObject.getTracks().forEach(t => t.stop());
    video.srcObject = null;
  }
  const display = document.getElementById("camera-display");
  if (display) display.srcObject = null;

  loopAtivo          = false;
  cameraIniciada     = false;
  modeloCarregado    = false;
  faceapi            = null;
  jogoEmAndamento    = false;
  aguardandoReinicio = false;
  prontoParaStart    = false;
  ausenciaInicio     = null;
  _limparInicioTimeout();
  _limparCanvas();
}

// Inicializacao

async function _iniciarCamera() {
  const video = document.getElementById("camera");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" }
    });

    video.srcObject = stream;

  
    _espelharParaDisplay(stream);

    await new Promise(resolve => {
      video.onloadedmetadata = () => { video.play(); resolve(); };
    });

    await _aguardarVideoReady(video);
    cameraIniciada = true;
    atualizarStatusCamera(false, "Carregando detector...");
    _iniciarModelo(video);

  } catch (err) {
    console.error("[camera] Erro ao acessar camera:", err);
    atualizarStatusCamera(false, "Camera indisponivel");
    _ativarModoManual();
  }
}

function _iniciarModelo(video) {
  const options = {
    withLandmarks:   true,
    withDescriptors: false,
    withTinyNet:     true,
    minConfidence:   0.5,
    MODEL_URLS: {
      TinyFaceDetectorModel: "assets/models/tiny_face_detector_model-shard1",
      FaceLandmark68TinyNet: "assets/models/face_landmark_68_tiny_model-shard1",
      FaceRecognitionModel:  "assets/models/face_recognition_model-shard1"
    }
  };

  faceapi = ml5.faceApi(video, options, () => {
    console.log("[camera] Modelo carregado.");
    modeloCarregado  = true;
    video.width      = video.videoWidth;
    video.height     = video.videoHeight;
    loopAtivo        = true;
    _loopDeteccao(video);
  });
}

// Loop de deteccao

function _loopDeteccao(video) {
  if (!loopAtivo || !faceapi || !modeloCarregado) return;

  if (video.readyState < 4 || video.videoWidth === 0) {
    requestAnimationFrame(() => _loopDeteccao(video));
    return;
  }

  faceapi.detect((err, results) => {
    if (err) {
      requestAnimationFrame(() => _loopDeteccao(video));
      return;
    }

    const temRosto     = results && results.length > 0;
    const rostoOlhando = temRosto && _estaOlhandoParaTela(results[0]);

    _desenharCanvas(video, results);

    if (jogoEmAndamento) {
      _logicaEmJogo(rostoOlhando, temRosto);
    } else {
      _logicaEspera(rostoOlhando, temRosto);
    }

    requestAnimationFrame(() => _loopDeteccao(video));
  });
}

// Logica de estados

function _logicaEspera(rostoOlhando, temRosto) {
  if (rostoOlhando) {
    atualizarStatusCamera(true, "Rosto detectado");
    if (!prontoParaStart) {
      prontoParaStart = true;
      mostrarProgressoInicio(DELAY_INICIO);
      inicioTimeout = setTimeout(() => {
        inicioTimeout   = null;
        prontoParaStart = false;
        esconderProgressoInicio();
        if (cbStart) cbStart();
      }, DELAY_INICIO);
    }
  } else {
    if (prontoParaStart) {
      _limparInicioTimeout();
      esconderProgressoInicio();
    }
    atualizarStatusCamera(false,
      temRosto ? "Olhe para a tela" : "Aproxime-se para comecar"
    );
  }
}

function _logicaEmJogo(rostoOlhando, temRosto) {
  if (!rostoOlhando && !temRosto) {
    if (ausenciaInicio === null) {
      ausenciaInicio = performance.now();
    } else if (performance.now() - ausenciaInicio > DELAY_AUSENCIA) {
      loopAtivo       = false;
      jogoEmAndamento = false;
      ausenciaInicio  = null;
      _limparInicioTimeout();
      _limparCanvas();
      if (cbLeave) cbLeave();
      return;
    }
  } else {
    ausenciaInicio = null;
  }
}

// Analise do rosto

function _estaOlhandoParaTela(result) {
  if (!result || !result.landmarks) return false;
  const pts = result.landmarks.positions;
  if (!pts || pts.length < 68) return false;

  const abrEsq = Math.abs(pts[37].y - pts[41].y);
  const abrDir = Math.abs(pts[44].y - pts[46].y);
  if (abrEsq < 4 || abrDir < 4) return false;

  const angulo = Math.abs(
    Math.atan2(pts[45].y - pts[36].y, pts[45].x - pts[36].x) * 180 / Math.PI
  );
  return angulo < 30;
}

// Canvas / bounding box

function _desenharCanvas(video, results) {
  const canvas = document.getElementById("camera-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width  = video.videoWidth  || video.offsetWidth;
  canvas.height = video.videoHeight || video.offsetHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!results || results.length === 0) return;

  const box = results[0].alignedRect?._box || results[0].detection?._box;
  if (!box) return;

  const scaleX = canvas.width  / (video.videoWidth  || canvas.width);
  const scaleY = canvas.height / (video.videoHeight || canvas.height);

  const x = box._x * scaleX;
  const y = box._y * scaleY;
  const w = box._width  * scaleX;
  const h = box._height * scaleY;
  const tam = 10;

  const cor = jogoEmAndamento ? "#2ecc71" : (prontoParaStart ? "#f39c12" : "#ffffff");
  ctx.strokeStyle = cor;
  ctx.lineWidth   = 1.5;
  ctx.shadowColor = cor;
  ctx.shadowBlur  = 6;

  ctx.beginPath(); ctx.moveTo(x,y+tam);     ctx.lineTo(x,y);     ctx.lineTo(x+tam,y);     ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+w-tam,y);   ctx.lineTo(x+w,y);   ctx.lineTo(x+w,y+tam);   ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x,y+h-tam);   ctx.lineTo(x,y+h);   ctx.lineTo(x+tam,y+h);   ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+w-tam,y+h); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w,y+h-tam); ctx.stroke();


  const overlay = document.getElementById("camera-overlay");
  if (overlay) {
    overlay.width  = canvas.width;
    overlay.height = canvas.height;
    const octx = overlay.getContext("2d");
    octx.clearRect(0, 0, overlay.width, overlay.height);
    octx.drawImage(canvas, 0, 0);
  }
}

function _limparCanvas() {
  ["camera-canvas", "camera-overlay"].forEach(id => {
    const c = document.getElementById(id);
    if (c) c.getContext("2d").clearRect(0, 0, c.width, c.height);
  });
}

// Fallback manual

function _ativarModoManual() {
  console.warn("[camera] Modo manual ativo.");
  const camHero = document.querySelector(".cam-hero");
  if (camHero) {
    camHero.style.background = "#1a1a1a";
    const lbl = document.getElementById("cam-bottom-label");
    if (lbl) {
      lbl.textContent = "Toque para comecar";
      lbl.style.cursor = "pointer";
      lbl.addEventListener("click", () => {
        if (cbStart) cbStart();
      }, { once: true });
    }
  }
}

// Utilitarios

function _limparInicioTimeout() {
  if (inicioTimeout) { clearTimeout(inicioTimeout); inicioTimeout = null; }
  prontoParaStart = false;
}

function _aguardarVideoReady(video) {
  return new Promise(resolve => {
    const check = () => {
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) resolve();
      else requestAnimationFrame(check);
    };
    check();
  });
}