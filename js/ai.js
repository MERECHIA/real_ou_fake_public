/**
 * ai.js
 * - Analisa imagem via Google Gemini
 * - Guard contra chamadas simultaneas
 * - Fallback offline usa dica do data.js
 */

import { atualizarDicaIA } from "./ui.js";


const GEMINI_API_KEY = "Minha_Chave"; // 

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
  "Leao.jpg":       "leao real com juba de textura variada e sombras naturais",
  "Lince.jpg":      "lince real com olhos com reflexos naturais e pelo com variacao",
  "Alce.jpg":       "alce real com reflexos naturais na pele e chifres assimetricos",
  "Arara.jpg":      "arara real com penas de cores vibrantes e texturas variadas",
  "Zebra.jpg":      "zebra real com listras de padrao unico e textura de pele natural",
  "Cavalo.jpg":     "cavalo real com musculos definidos e pelo com variacao natural",
  "Tubaraobranco.jpg": "tubarao branco real com reflexos fisicamente corretos na pele molhada",
  "Cisne.jpg":      "cisne real com reflexos naturais na agua e penas de textura variada",
  "Esquilo.jpg":    "esquilo real com pelo de textura irregular e cauda volumosa",
  "Jacare.jpg":     "jacare real com pele de textura rugosa e reflexos naturais na agua",
  "Marreco.jpg":    "marreco real com detalhes do bico e penas de textura variada",
  "Tigre.jpg":      "tigre real com listras de padrao unico e pelo com variacao natural",
  "Barracuda.jpg":  "barracuda real com corpo aerodinamico e reflexos naturais na pele molhada",
  "Beijaflor.jpg":  "beijaflor real com penas de cores vibrantes e detalhes do voo naturais",
  "Borboleta.jpg":  "borboleta real com asas de padrao unico e textura natural",
  "Orangotango.jpg": "orangotango real com pelo de textura variada e expressao facial natural",
  "Orca.jpg":       "orca real com pele de textura natural e reflexos corretos na agua",
  "Tubaraobaleia.jpg": "tubarao baleia real com corpo macico e reflexos naturais na pele molhada",
  "IALontra.png":   "lontra gerada por IA com pelo artificialmente uniforme e simetrico",
  "IAUrso.png":     "urso gerado por IA com fundo artificial e iluminacao uniforme no pelo",
  "IACoelho.png":   "coelho gerado por IA com olhos sinteticos e proporcoes artificiais",
  "IAGolfinho.png": "golfinho gerado por IA com reflexos repetitivos e irreais na agua",
  "IAArraia.png":   "arraia gerada por IA com contorno exageradamente suave e simetrico",
  "IACoruja.png":   "coruja gerada por IA com penas de padrao repetitivo e olhos artificiais",
  "IAGirafa.png":   "girafa gerada por IA com padroes simetricos gerados artificialmente",
  "IALeao.png":     "leao gerado por IA com juba de textura uniforme e iluminacao artificial",
  "IALince.png":    "lince gerado por IA com olhos sem reflexos naturais e pelo uniforme",
  "IAAlce.png":     "alce gerado por IA com reflexos artificiais e chifres simetricos",
  "IAArara.png":    "arara gerada por IA com penas de cores planas e texturas artificiais",
  "IAZebra.png":    "zebra gerada por IA com listras de padrao repetitivo e pele sem textura natural",
  "IACavalo.png":   "cavalo gerado por IA com musculos pouco definidos e pelo uniforme",
  "IATubaraobranco.png": "tubarao branco gerado por IA com reflexos artificiais e pele sem textura natural",
  "IACisne.png":    "cisne gerado por IA com reflexos na agua que nao seguem a fisica real",
  "IAEsquilo.png":  "esquilo gerado por IA com pelo de textura uniforme e cauda sem volume natural",
  "IAJacare.png":   "jacare gerado por IA com pele de textura repetitiva e reflexos artificiais na agua",
  "IAMarreco.png":  "marreco gerado por IA com detalhes do bico pouco definidos e penas sem textura natural",
  "IATigre.png":    "tigre gerado por IA com listras de padrao repetitivo e pelo sem variacao natural",
  "IABarracuda.png": "barracuda gerada por IA com corpo sem textura natural e reflexos artificiais na pele molhada",
  "IABeijaflor.png": "beijaflor gerado por IA com penas de cores planas e detalhes do voo artificiais",
  "IABorboleta.png": "borboleta gerada por IA com asas no mesmo plano e padrao repetitivo",
  "IAOrangotango.png": "orangotango gerado por IA com pelo de textura uniforme e expressao facial sem naturalidade",
  "IAOrca.png":      "orca gerada por IA com pele sem textura natural e reflexos que nao se integram ao ambiente",
  "IATubaraobaleia.png": "tubarao baleia gerado por IA com corpo sem textura natural e boca fora da proporcao realista"
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