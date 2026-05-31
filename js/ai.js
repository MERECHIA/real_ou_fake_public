/**
 * ai.js
 * - Analisa imagem via Google Gemini
 * - Timeout via Promise.race com delay
 * - Guard contra chamadas simultaneas
 * - Fallback offline usa dica do data.js
 */

import { atualizarDicaIA } from "./ui.js";


const GEMINI_API_KEY = "Minha_Chave"; 

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

// Timeout generoso 
const TIMEOUT_MS = 20000;

// Guard: impede chamadas simultaneas
let analisandoAgora = false;

// Contexto especifico por imagem
const CONTEXTO_IMAGENS = {
  "lontra.jpg":     "lontra real fotografada em habitat natural, pelo molhado com imperfeicoes",
  "Urso.jpg":       "urso real fotografado na natureza, pelo com variacao e sombras naturais",
  "Coelho.jpg":     "coelho real com orelhas com veias visiveis e pelo irregular",
  "Golfinho.jpg":   "golfinho real com reflexos fisicamente corretos na pele molhada",
  "Arraia.jpg":     "arraia real com textura de pele e reflexos subaquaticos naturais",
  "Coruja.jpg":     "coruja real com penas de variacao individual e olhos com reflexo natural",
  "Girafa.jpg":     "girafa real com padroes de pelo assimetricos e unicos",
  "IALontra.png":   "lontra gerada por IA com pelo artificialmente uniforme e simetrico",
  "IAUrso.png":     "urso gerado por IA com fundo artificial e iluminacao uniforme no pelo",
  "IACoelho.png":   "coelho gerado por IA com olhos sinteticos e proporcoes artificiais",
  "IAGolfinho.png": "golfinho gerado por IA com reflexos repetitivos e irreais na agua",
  "IAArraia.png":   "arraia gerada por IA com contorno exageradamente suave e simetrico",
  "IACoruja.png":   "coruja gerada por IA com penas de padrao repetitivo e olhos artificiais",
  "IAGirafa.png":   "girafa gerada por IA com padroes simetricos gerados artificialmente",
};


export async function analisarImagemErro(imagemSrc, tipoCorreto, dicaLocal) {
  if (analisandoAgora) {
    console.warn("[ai] Chamada ja em andamento, usando fallback.");
    atualizarDicaIA(dicaLocal);
    return;
  }

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "Minha_Chave") {
    atualizarDicaIA(dicaLocal);
    return;
  }

  analisandoAgora = true;

  try {
    const nomeArquivo = imagemSrc.split("/").pop();
    const contexto    = CONTEXTO_IMAGENS[nomeArquivo] || nomeArquivo;

    const prompt = tipoCorreto === "fake"
      ? `Esta imagem e de um animal gerado por IA: "${contexto}". Em 1 frase direta (maximo 15 palavras), explique UM detalhe visual especifico que revela que e falsa. Responda em portugues, sem introducao, so a explicacao.`
      : `Esta e uma foto real de animal: "${contexto}". Em 1 frase direta (maximo 15 palavras), explique UM detalhe que confirma que e uma foto real. Responda em portugues, sem introducao, so a explicacao.`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 60 }
    };

    const texto = await Promise.race([
      _chamarGemini(body),
      _timeoutPromise(TIMEOUT_MS, dicaLocal)
    ]);

    atualizarDicaIA(texto);

  } catch (err) {
    console.warn("[ai] Erro na analise:", err.message);
    atualizarDicaIA(dicaLocal);
  } finally {
    analisandoAgora = false;
  }
}

// Feedback geral na tela final

export async function gerarFeedbackIA(score, total) {
  const feedbackEl = document.getElementById("feedback-ia");
  if (!feedbackEl) return;

  if (!GEMINI_API_KEY || GEMINI_API_KEY === "Minha_Chave") {
    feedbackEl.textContent = _feedbackLocal(score, total);
    return;
  }

  try {
    const pct   = score / total;
    const nivel = pct === 1 ? "perfeito" : pct >= 0.6 ? "bom" : pct >= 0.4 ? "medio" : "fraco";

    const body = {
      contents: [{
        parts: [{
          text: `Jogador acertou ${score} de ${total} imagens no jogo "Real ou Fake?" identificando fotos reais vs imagens geradas por IA. Desempenho: ${nivel}. Escreva 1 frase encorajadora (maximo 15 palavras) em portugues, sem introducao.`
        }]
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 50 }
    };

    const texto = await Promise.race([
      _chamarGemini(body),
      _timeoutPromise(TIMEOUT_MS, _feedbackLocal(score, total))
    ]);

    feedbackEl.textContent = texto;

  } catch (err) {
    console.warn("[ai] Feedback final offline:", err.message);
    feedbackEl.textContent = _feedbackLocal(score, total);
  }
}

// Utilitarios

async function _chamarGemini(body) {
  const resposta = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const dados = await resposta.json();
  console.log("[ai] Resposta Gemini:", dados);

  if (dados.error) {
    throw new Error(`Gemini ${dados.error.code}: ${dados.error.message}`);
  }

  const texto = dados?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!texto) throw new Error("Resposta vazia");
  return texto;
}

function _timeoutPromise(ms, fallback) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.warn(`[ai] Timeout de ${ms}ms, usando fallback.`);
      resolve(fallback);
    }, ms);
  });
}

function _feedbackLocal(score, total) {
  const pct = score / total;
  if (pct === 1)  return "Incrivel! Você identificou todas as imagens corretamente.";
  if (pct >= 0.6) return "Bom olho! Você está aprendendo a detectar criações de IA.";
  if (pct >= 0.4) return "Quase lá! As IAs modernas são cada vez mais convincentes.";
  return "A IA te enganou dessa vez. Preste atenção nas texturas e iluminação!"
}