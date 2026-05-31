import { comecarJogo, verificar, continuar, reiniciarJogo } from "./game.js";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-comecar").addEventListener("click", comecarJogo);
  document.getElementById("btn-real").addEventListener("click", () => verificar("real"));
  document.getElementById("btn-fake").addEventListener("click", () => verificar("fake"));
  document.getElementById("btn-continuar").addEventListener("click", continuar);
  document.getElementById("btn-reiniciar-jogo").addEventListener("click", reiniciarJogo);
  document.getElementById("btn-reiniciar-final").addEventListener("click", reiniciarJogo);
});
