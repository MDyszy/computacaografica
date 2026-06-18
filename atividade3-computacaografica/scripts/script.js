// Configuração inicial de canvas ()
canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d"); 

// Dimensão do Canvas para tela inteira
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

keys = {}; // Objeto para teclado

// Clique de teclas 
window.addEventListener("keydown", (e) => { // Evento para tecla espaço
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

function closeWindow(){ // Função para fechar a aplicação
    alert("Aplicação encerrada!")
    window.close();
}

function randomColor(){ // Função para gerar cores aleatórias
    return '#' + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0');
}

function putPixel (x, y, color){ // Função para desenhar um ponto
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}

function numberVertices(){ // Função de sorte do número de vértices
    min = Math.ceil(3);
    max = Math.floor(8);

    return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomPositions(){ // Sorteio de posição aleatória
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    
    return {x, y};
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

function createPoligon(lineColor,positionsVertice){ // Desenho do polígono
    for(let i = 0; i < positionsVertice.length; i++){
        x = positionsVertice[i].x;
        y = positionsVertice[i].y;

        putPixel(x, y, lineColor);

        if(i == positionsVertice.length - 1){
            linhaDDA(positionsVertice[0].x, positionsVertice[0].y, positionsVertice[i].x, positionsVertice[i].y, lineColor);
        }
        else{
            linhaDDA(positionsVertice[i].x, positionsVertice[i].y, positionsVertice[i+1].x, positionsVertice[i+1].y, lineColor);
        }
    } 
}

function scanLineFill(positionsVertice, insideColor){ // Função algoritmo Scan Line Fill

    // Passo 1 - Montar a tabela de lados
    const tabela = [];

    for(let i = 0; i < positionsVertice.length; i++){
        p1 = positionsVertice[i];
        
        if(i == positionsVertice.length - 1){
            p2 = positionsVertice[0];
        }
        else{
            p2 = positionsVertice[i + 1];
        }

        if(p1.y < p2.y){
            ymin = p1.y;
            ymax = p2.y;
            xymin = p1.x;
        }
        else{
            ymin = p2.y;
            ymax = p1.y;
            xymin = p2.x;
        }

        mInv = (p2.x - p1.x) / (p2.y - p1.y);

        tabela.push({ymin, ymax, xymin, mInv});
    }

    menorY = Math.ceil(Math.min(...tabela.map(e => e.ymin)));
    maiorY = Math.floor(Math.max(...tabela.map(e => e.ymax)));

    for(let yVarredura = menorY; yVarredura <= maiorY; yVarredura++){        

        intersecoes = [];

        // Passo 2 - Interseção com a linha de varredura
        // Inserção com linha de varredura

        for(let k = 0; k < tabela.length; k++){
            if(yVarredura < tabela[k].ymin || yVarredura >= tabela[k].ymax){ // Eliminar lados do polígono que a linha não intercepta 
                continue;                                                    // Considerar apenas uma inserção se o vértice tem ymax para um lado ymin para outro
            } 

            if(tabela[k].ymin == tabela[k].ymax){ // Tratamento para linhas horizontais
                continue;
            }
            
            x = tabela[k].mInv * (yVarredura - tabela[k].ymin) + tabela[k].xymin;
            intersecoes.push(x);
        }


        // Terceiro Passo - Ordenação e Pintura

        // Ordenar o pontos de interseções
        for(let m = 0; m < intersecoes.length - 1; m++){
            for(let n = 0; n < intersecoes.length - 1 - m; n++){
                if(intersecoes[n] > intersecoes[n +1]){
                    temp = intersecoes[n];
                    intersecoes[n] = intersecoes[n + 1];
                    intersecoes[n + 1] = temp;
                }
            }
        }

        // Tomar pontos 2 a 2
        for(let l = 0; l < intersecoes.length - 1; l += 2){
            xInicio = Math.ceil(intersecoes[l]);
            xFim = Math.floor(intersecoes[l + 1]);

            for(let x = xInicio; x <= xFim; x++){
                putPixel(x, yVarredura, insideColor);
            }
        }
    }
}

function update(){
    if(keys[" "]){
        lineColor = randomColor();
        insideColor = randomColor();
        nVertices = numberVertices();
        positionsVertice = [];

        for(let i = 0; i < nVertices; i++){
            positionsVertice.push(randomPositions());
        }

        createPoligon(lineColor, positionsVertice);
        scanLineFill(positionsVertice, insideColor);
    } 

    if(keys["escape"]){
        closeWindow();
    }

    setTimeout(update, 100);
}

update();