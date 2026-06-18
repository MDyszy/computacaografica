// Configuração inicial de canvas ()
canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d"); 

// Dimensão do Canvas para tela inteira
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("keydown", (e) => { // Evento para tecla esc
    keys[e.key.toLowerCase()] = true;
});

keys = {}; // Objeto para controle da tecla esc 

function closeWindow(){ // Função para fechar a aplicação
    alert("Aplicação encerrada!")
    window.close();
}

function positionsLine(){ // Gerador de posições iniciais e finais para a reta
    const x1 = Math.random() * canvas.width;
    const x2 = Math.random() * canvas.width;
    const y1 = Math.random() * canvas.height;
    const y2 = Math.random() * canvas.height;

    return {x1, x2, y1, y2};
}

function positionCircle(){ // Gerador do centro e do raio para o círculo
    const xc = Math.random() * canvas.width;
    const yc = Math.random() * canvas.height;
    const radius = Math.random() * 200; // Raio máximo de 200 pixels

    return {xc, yc, radius};
}

function selector(){ // Seleção aleatória para linha ou círculo
    return Math.random();
}

function randomColor(){ // Função para gerar cores aleatórias
    return '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
}

function putPixel (x, y, color){ // Função para desenhar um ponto
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

    putPixel(x1, y1, color);

    for(let i = 0; i < steps; i++){
        x1 += incX;
        y1 += incY;
        putPixel(x1, y1, color);
    }
}

function circBrasenham (xc, yc, r, color){ // Função para desenhar um círculo usando o algoritmo de Bresenham
    let x = 0;
    let y = r - 1;
    let d = 1 - r;

    putPixel(xc + x, yc - y, color);
    putPixel(xc + y, yc - x, color);
    putPixel(xc + y, yc + x, color);
    putPixel(xc + x, yc + y, color);
    putPixel(xc - x, yc + y, color);
    putPixel(xc - y, yc + x, color);
    putPixel(xc - y, yc - x, color);
    putPixel(xc - x, yc - y, color);

    while(y > x){
        if(d < 0){
            d += 2 * x + 3;
        }
        else{
            d += 2 * (x - y) + 5;
            y--;
        }

        x++;

        putPixel(xc + x, yc - y, color);
        putPixel(xc + y, yc - x, color);
        putPixel(xc + y, yc + x, color);
        putPixel(xc + x, yc + y, color);
        putPixel(xc - x, yc + y, color);
        putPixel(xc - y, yc + x, color);
        putPixel(xc - y, yc - x, color);
        putPixel(xc - x, yc - y, color);
    }
}   

function update(){
    if(keys["escape"]){
        closeWindow();
    }

    colorInteraction = randomColor();
    
    if (selector() < 0.5){
        const {xc, yc, radius} = positionCircle();
        circBrasenham(xc, yc, radius, colorInteraction);
    }
    else{
        const {x1, x2, y1, y2} = positionsLine();
        linhaDDA(x1, y1, x2, y2, colorInteraction);
    }

    setTimeout(update, 100);
}

update();