import {comecarJogo,verificar,continuar,reiniciarJogo} from "./game.js";
import { iniciarCameraAuto} from "./camera.js";

window.comecarJogo = comecarJogo;
window.verificar = verificar;
window.continuar = continuar;
window.reiniciarJogo = reiniciarJogo;

document.addEventListener("DOMContentLoaded", () => {
    iniciarCameraAuto(comecarJogo, reiniciarJogo);
});