
let faceapi;
let cameraAtiva = false;
let modeloCarregado = false;
let prontoParaStart = false;
let jogoEmAndamento = false;
let onLeave = null;
let ausenciaInicio = null;
let inicioTimeout = null;



export async function iniciarCameraAuto(callback, leaveCallback = null) {
    prontoParaStart = false;
    jogoEmAndamento = false;
    ausenciaInicio = null;
    onLeave = leaveCallback;
    if (inicioTimeout) {
        clearTimeout(inicioTimeout);
        inicioTimeout = null;
    }
    if (cameraAtiva) return;
    cameraAtiva = true;

    const video = document.getElementById("camera");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            video.play();

            
            setTimeout(() => {
                const waitForVideoReady = () => {
                    if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
                        iniciarFaceAPI(video, callback);
                    } else {
                        requestAnimationFrame(waitForVideoReady);
                    }
                };

                waitForVideoReady();
            }, 2000);
        };
    } catch (err) {
        console.error("Erro ao acessar câmera:", err);
    }
}

function iniciarFaceAPI(video, callback) {
    
    const options = {
        withLandmarks: true,
        withDescriptors: true,
        withTinyNet: true,
        minConfidence: 0.5,
        MODEL_URLS: {
            TinyFaceDetectorModel: 'assets/models/tiny_face_detector_model-weights_manifest.json',
            FaceLandmark68TinyNet: 'assets/models/face_landmark_68_tiny_model-weights_manifest.json',
            FaceRecognitionModel: 'assets/models/face_recognition_model-weights_manifest.json'
        }
    };

    faceapi = ml5.faceApi(video, options, () => {
        console.log("Modelo de detecção de rosto carregado!");
        modeloCarregado = true;

        const startWhenVideoReady = () => {
            if (video.readyState === 4 && video.videoWidth > 0 && video.videoHeight > 0) {
                video.width = video.videoWidth;
                video.height = video.videoHeight;
                detectar(video, callback);
            } else {
                requestAnimationFrame(startWhenVideoReady);
            }
        };

        startWhenVideoReady();
    });
}

function estaOlhandoParaTela(result) {
    if (!result.landmarks) return false;

    const landmarks = result.landmarks.positions;

    
    const olhoEsquerdo = {
        superior: landmarks[37], 
        inferior: landmarks[41]  
    };
    const olhoDireito = {
        superior: landmarks[44], 
        inferior: landmarks[46]  
    };

    
    const aberturaOlhoEsq = Math.abs(olhoEsquerdo.superior.y - olhoEsquerdo.inferior.y);
    const aberturaOlhoDir = Math.abs(olhoDireito.superior.y - olhoDireito.inferior.y);

    
    const olhosAbertos = aberturaOlhoEsq > 5 && aberturaOlhoDir > 5;

    
    const olhoEsq = landmarks[36];
    const olhoDir = landmarks[45];
    const nariz = landmarks[30]; 

    const anguloCabeca = Math.abs(Math.atan2(olhoDir.y - olhoEsq.y, olhoDir.x - olhoEsq.x) * 180 / Math.PI);

    
    const cabecaReta = anguloCabeca < 30;

    return olhosAbertos && cabecaReta;
}

async function detectar(video, callback) {
    const status = document.getElementById("status-camera");

    if (!faceapi || !modeloCarregado) return;

    if (video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) {
        requestAnimationFrame(() => detectar(video, callback));
        return;
    }

    faceapi.detect((err, results) => {
        if (err) {
            console.error(err);
            requestAnimationFrame(() => detectar(video, callback));
            return;
        }

        const temPessoa = results && results.length > 0;
        const pessoaOlhando = temPessoa && estaOlhandoParaTela(results[0]);

        if (!jogoEmAndamento) {
            if (pessoaOlhando) {
                if (!prontoParaStart) {
                    prontoParaStart = true;
                    if (status) {
                        status.textContent = "Pessoa detectada! Preparando para iniciar...";
                    }
                    inicioTimeout = setTimeout(() => {
                        inicioTimeout = null;
                        jogoEmAndamento = true;
                        prontoParaStart = false;
                        ausenciaInicio = null;
                        console.log("Jogo iniciado! jogoEmAndamento =", jogoEmAndamento);
                        callback();
                    }, 2000);
                }
            } else {
                if (prontoParaStart) {
                    clearTimeout(inicioTimeout);
                    inicioTimeout = null;
                    prontoParaStart = false;
                }
                if (temPessoa) {
                    if (status) {
                        status.textContent = "Olhe para a tela para começar";
                    }
                } else {
                    if (status) {
                        status.textContent = "Aproxime-se para começar";
                    }
                }
            }
            requestAnimationFrame(() => detectar(video, callback));
        } else {
            if (!temPessoa || !pessoaOlhando) {
                if (ausenciaInicio === null) {
                    ausenciaInicio = performance.now();
                    console.log("⏱Começou a contar ausência da pessoa");
                } else {
                    const tempoAusente = performance.now() - ausenciaInicio;
                    console.log(`Tempo ausente: ${tempoAusente.toFixed(0)}ms`);
                    
                    if (tempoAusente > 3000) {
                        console.log("❌ Pessoa saiu da tela! Chamando onLeave...");
                        console.log("onLeave:", onLeave);
                        if (onLeave) {
                            console.log("Executando reiniciarJogo...");
                            clearTimeout(inicioTimeout);
                            inicioTimeout = null;
                            const leaveCallback = onLeave;
                            pararDeteccao();
                            leaveCallback();
                            return;
                        } else {
                            console.warn("onLeave não está definido!");
                        }
                    }
                }
                if (status) {
                    status.textContent = "Pessoa saiu da tela. Reiniciando...";
                }
            } else {
                ausenciaInicio = null;
            }
            requestAnimationFrame(() => detectar(video, callback));
        }
    });
}

export function pararDeteccao() {
    const video = document.getElementById("camera");
    if (video && video.srcObject) {
        video.srcObject.getTracks().forEach((track) => track.stop());
        video.srcObject = null;
    }
    if (inicioTimeout) {
        clearTimeout(inicioTimeout);
        inicioTimeout = null;
    }
    prontoParaStart = false;
    jogoEmAndamento = false;
    cameraAtiva = false;
    modeloCarregado = false;
    onLeave = null;
    ausenciaInicio = null;
}   