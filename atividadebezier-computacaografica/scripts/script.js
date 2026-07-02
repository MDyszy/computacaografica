// Configuração inicial do canvas
canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");

// Dimensão do Canvas para a tela inteira
canvas.width = 600;
canvas.height = 400;

// Definição de pontos
const b0 = [50,100]
const b1 = [300,50]
const b2 = [550,100]
const dt = 0.001

function blackColor(){ // Função para gerar cor preta
    return "#000000";
}

function redColor(){
    return "#ff0000"
}

function putPixelPoints(x, y, color){ // Função para desenhar um ponto
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 4, 4);
}

function putPixelCurva(x, y, color){ // Função putPixel para desenha a curva para melhor visualização
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function linhaDDA(x1, y1, x2, y2, color){ // Função para desenhar uma linha usando o algoritmo DDA
    const dx = x2 - x1;
    const dy = y2 - y1;
    let steps; 

    if(Math.abs(dx) > Math.abs(dy)){
        steps = Math.abs(dx);
    } else {
        steps = Math.abs(dy);
    }

    let incX = dx / steps;
    let incY = dy / steps;

    putPixelCurva(x1, y1, color);

    for(let i = 0; i < steps; i++){
        x1 += incX;
        y1 += incY;
        putPixelCurva(x1, y1, color);
    }
}

function bezier(b0, b1, b2, dt) {
    let px_0 = Math.pow((1 - 0), 2) * b0[0] + 2 * 0 * (1 - 0) * b1[0] + Math.pow(0, 2) * b2[0]
    let py_0 = Math.pow((1 - 0), 2) * b0[1] + 2 * 0 * (1 - 0) * b1[1] + Math.pow(0, 2) * b2[1]

    for (let i = dt; i <= 1; i += dt) {
        const px_1 = Math.pow((1 - i), 2) * b0[0] + 2 * i * (1 - i) * b1[0] + Math.pow(i, 2) * b2[0]
        const py_1 = Math.pow((1 - i), 2) * b0[1] + 2 * i * (1 - i) * b1[1] + Math.pow(i, 2) * b2[1]

        linhaDDA(px_0, py_0, px_1, py_1, blackColor())
        
        px_0 = px_1
        py_0 = py_1
    }
}

function update(){ // Função de atualização
    putPixelPoints(b0[0], b0[1], redColor());
    putPixelPoints(b1[0], b1[1], redColor());
    putPixelPoints(b2[0], b2[1], redColor());

    bezier(b0, b1, b2, dt);

    setTimeout(update, 100);
}

update();