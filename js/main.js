import { comecarJogo, verificar, continuar, reiniciarJogo } from "./game.js";
import { iniciarCameraAuto } from "./camera.js";

document.addEventListener("DOMContentLoaded", () => {
  
  document.getElementById("btn-real").addEventListener("click", () => verificar("real"));
  document.getElementById("btn-fake").addEventListener("click", () => verificar("fake"));
  document.getElementById("btn-continuar").addEventListener("click", continuar);

  iniciarCameraAuto(comecarJogo, reiniciarJogo);
});
