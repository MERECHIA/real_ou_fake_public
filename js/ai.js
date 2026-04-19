
export function gerarFeedbackIA(score, total) {
    const feedbacks = document.getElementById("feedback-ia");
    if (score === total) {  
        feedbacks.textContent = "Perfeito você domina isso!";
    } else if (score >= total / 2) {
        feedbacks.textContent = "Bom trabalho, mas ainda há espaço para melhorias.";
    }  else {
        feedbacks.textContent = "A  IA te enganou.";
    }
}    