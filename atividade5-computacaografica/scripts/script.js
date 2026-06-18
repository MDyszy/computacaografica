// Configuração inicial do canvas
canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");

// Dimensão do Canvas para a tela inteira
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

inputArq = document.querySelector('#button-file'); // Configuração do input para receber o arquivo .txt

objeto = null; // Objeto que receberá o que será lido no .txt

keys = {}; // Objeto para teclado

divAjuda = document.querySelector("#ajuda"); // Popup de ajuda
divNomeProjecao = document.querySelector("#nome-projecao");

const projecoes = [
    "Paralela Obliqua Cavaleira",
    "Paralela Obliqua Cabinet",
    "Paralela Ortografica Isometrica",
    "Perspectiva com um ponto de fuga em Z",
    "Perspectiva com dois pontos de fuga, em X e em Z",
];
let indiceProj = 0;

// Clique de teclas
window.addEventListener("keydown", (e) => {
    if (e.key === "F1"){
        e.preventDefault();
        divAjuda.classList.toggle("oculto");
        return;
    }

    if (e.key.toLowerCase() === "p"){
        indiceProj = (indiceProj + 1) % projecoes.length;
        return;
    }

    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

inputArq.addEventListener('change', function(){ // Evento de inserção do arquivo.txt
    const arquivo = this.files[0];
    const leitor = new FileReader();

    leitor.addEventListener('load', function(){
        criadorEstrutura3D(leitor.result);
    });

    if(arquivo){
        leitor.readAsText(arquivo);
    }
});

function criadorEstrutura3D(arquivo){ // Função para criar a estrutura do objeto 3D a partir do arquivo .txt
    linhasArq = arquivo.split("\n");

    const n = parseInt(linhasArq[0]);
    const m = parseInt(linhasArq[1]);

    const pontos = [];
    for(let i = 0; i < n; i++){
        coluna = linhasArq[2 + i].split(" ");
        pontos[i] = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];
    }

    const linhas = [];
    for(let i = 0; i < m; i++){
        coluna = linhasArq[2 + n + i].split(" ");
        linhas[i] = [parseInt(coluna[0]), parseInt(coluna[1])];
    }

    coluna = linhasArq[2 + n + m].split(" ");
    const translacao = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])]; 

    coluna = linhasArq[2 + n + m + 1].split(" ");
    const rotacao = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])]; 

    coluna = linhasArq[2 + n + m + 2].split(" ");
    const escala = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];

    objeto = [n, m, pontos, linhas, translacao, rotacao, escala];

    return objeto;
}

const MobCavaleira = [ // Matriz para projeção Cavalera ( ângulo de 45°, l = 1 - Arakaki)
    [1, 0, -1 * Math.cos(Math.PI / 4), 0],
    [0, 1, -1 * Math.sin(Math.PI / 4), 0],
    [0, 0,               0            , 0],
    [0, 0,               0            , 1]
];

const MobCabinet = [ // Matriz para projeção Cabinet ( ângulo de 63,4°, l = 0.5 - Arakaki)
    [1, 0, -0.5 * Math.cos(63.4 * Math.PI / 180), 0],
    [0, 1, -0.5 * Math.sin(63.4 * Math.PI / 180), 0],
    [0, 0,               0                       , 0],
    [0, 0,               0                       , 1]
];

const MobOrtografica = [ // Matriz para a projeção Ortográfica ( ângulo de 90º, l = 0 - Arakaki)
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1]
];

const d = 3;
const MPersp1 = [ // Matriz para perspectiva com 1 ponto de fuga no eixo Z
    [1, 0,   0, 0],
    [0, 1,   0, 0],
    [0, 0,   0, 0],
    [0, 0, 1/d, 1]
];

const dx = 3, dz = 3;
const MPersp2 = [ // Matriz para perspectiva com 2 pontos de fuga nos eixos X e Z
    [    1, 0,    0, 0],
    [    0, 1,    0, 0],
    [    0, 0,    1, 0],
    [1/dx, 0, 1/dz, 1]
];

function matrizEscala(sx, sy, sz){ // Monta a matriz 4x4 de escala
    return [
        [sx,  0,  0, 0],
        [ 0, sy,  0, 0],
        [ 0,  0, sz, 0],
        [ 0,  0,  0, 1]
    ];
}

function multiplicaMatrizes(a, b){ // Multiplica duas matrizes 4x4
    const matrizAlimentada = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];

    for (let i = 0; i < 4; i++){
        for (let j = 0; j < 4; j++){
            for (let k = 0; k < 4; k++){
                matrizAlimentada[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    return matrizAlimentada;
}

function matrizRotacaoX(anguloRad){ // Matriz 4x4 de rotação ao redor do eixo X
    return [
        [1, 0,  0, 0],
        [0, Math.cos(anguloRad), -Math.sin(anguloRad), 0],
        [0, Math.sin(anguloRad),  Math.cos(anguloRad), 0],
        [0, 0,  0, 1]
    ];
}

function matrizRotacaoY(anguloRad){ // Matriz 4x4 de rotação ao redor do eixo Y
    return [
        [ Math.cos(anguloRad), 0, Math.sin(anguloRad), 0],
        [ 0, 1, 0, 0],
        [-Math.sin(anguloRad), 0, Math.cos(anguloRad), 0],
        [ 0, 0, 0, 1]
    ];
}

function matrizRotacaoZ(anguloRad){ // Matriz 4x4 de rotação ao redor do eixo Z
    return [
        [Math.cos(anguloRad), -Math.sin(anguloRad), 0, 0],
        [Math.sin(anguloRad),  Math.cos(anguloRad), 0, 0],
        [0,  0, 1, 0],
        [0,  0, 0, 1]
    ];
}

function matrizRotacao(rx, ry, rz){ // Combina as rotações dos 3 eixos numa matriz 4x4
    const Rx = matrizRotacaoX(rx * Math.PI / 180);
    const Ry = matrizRotacaoY(ry * Math.PI / 180);
    const Rz = matrizRotacaoZ(rz * Math.PI / 180);
    return multiplicaMatrizes(Rz, multiplicaMatrizes(Ry, Rx));
}

function matrizTranslacao(tx, ty, tz){ // Monta a matriz 4x4 de translação
    return [
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0,  1]
    ];
}

function atualizaEscala(objeto){ // Aplica os incrementos de escala conforme as teclas pressionadas
    const escala = objeto[6];
    const passoEscala = 0.01; 

    if (keys["a"]) escala[0] += passoEscala; 
    if (keys["z"]) escala[0] -= passoEscala; 
    if (keys["s"]) escala[1] += passoEscala; 
    if (keys["x"]) escala[1] -= passoEscala; 
    if (keys["d"]) escala[2] += passoEscala; 
    if (keys["c"]) escala[2] -= passoEscala; 
}

function atualizaRotacao(objeto){ // Aplica os incrementos de rotação conforme as teclas pressionadas
    const rotacao = objeto[5];
    const passoRotacao = 0.1; 

    if (keys["f"]) rotacao[0] += passoRotacao; 
    if (keys["v"]) rotacao[0] -= passoRotacao; 
    if (keys["g"]) rotacao[1] += passoRotacao; 
    if (keys["b"]) rotacao[1] -= passoRotacao; 
    if (keys["h"]) rotacao[2] += passoRotacao; 
    if (keys["n"]) rotacao[2] -= passoRotacao; 
}

function atualizaTranslacao(objeto){ // Aplica os incrementos de translação conforme as teclas pressionadas
    const translacao = objeto[4];
    const passoTranslacao = 0.01; 

    if (keys["j"]) translacao[0] += passoTranslacao; 
    if (keys["m"]) translacao[0] -= passoTranslacao; 
    if (keys["k"]) translacao[1] += passoTranslacao; 
    if (keys[","]) translacao[1] -= passoTranslacao; 
    if (keys["l"]) translacao[2] += passoTranslacao; 
    if (keys["."]) translacao[2] -= passoTranslacao; 
}

function projCavalera(objeto){ // Função para projeção utilizando cavalera
    const vertices = objeto[2];
    const arestas = objeto[3];
    const translacao = objeto[4];
    const rotacao = objeto[5];
    const escala = objeto[6];

    // Calcula o centro geométrico do objeto para centralizar na tela
    const todosX = vertices.map(v => v[0]);
    const todosY = vertices.map(v => v[1]);
    const todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

    const centroCanvasX = canvas.width / 2;
    const centroCanvasY = canvas.height / 2;

    // Combina tudo numa única matriz: M = Mob · Translação · Rotação · Escala
    const escalaM = matrizEscala(escala[0], escala[1], escala[2]);
    const rotacaoM = matrizRotacao(rotacao[0], rotacao[1], rotacao[2]);
    const translacaoM = matrizTranslacao(translacao[0], translacao[1], translacao[2]);
    const M = multiplicaMatrizes(MobCavaleira, multiplicaMatrizes(translacaoM, multiplicaMatrizes(rotacaoM, escalaM)));

    for (let i = 0; i < objeto[1]; i++){
        const p1 = arestas[i][0];
        const p2 = arestas[i][1];

        // Subtrai o centro para que a origem fique no centro do objeto
        const vert1 = [vertices[p1][0] - centroX, vertices[p1][1] - centroY, vertices[p1][2] - centroZ, 1];
        const vert2 = [vertices[p2][0] - centroX, vertices[p2][1] - centroY, vertices[p2][2] - centroZ, 1];
        const res1 = [0, 0, 0, 0];
        const res2 = [0, 0, 0, 0];

        for (let j = 0; j < 4; j++){
            for (let k = 0; k < 4; k++){
                res1[j] += M[j][k] * vert1[k];
                res2[j] += M[j][k] * vert2[k];
            }
        }

        const x1final = centroCanvasX + res1[0] * 75;
        const x2final = centroCanvasX + res2[0] * 75;
        const y1final = centroCanvasY - res1[1] * 75;
        const y2final = centroCanvasY - res2[1] * 75;

        linhaDDA(x1final, y1final, x2final, y2final, blackColor());
    }
}

function projCabinet(objeto){ // Função para projeção utilizando cabinet
    const vertices = objeto[2];
    const arestas = objeto[3];
    const translacao = objeto[4];
    const rotacao = objeto[5];
    const escala = objeto[6];

    const todosX = vertices.map(v => v[0]);
    const todosY = vertices.map(v => v[1]);
    const todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

    const centroCanvasX = canvas.width / 2;
    const centroCanvasY = canvas.height / 2;

    const escalaM = matrizEscala(escala[0], escala[1], escala[2]);
    const rotacaoM = matrizRotacao(rotacao[0], rotacao[1], rotacao[2]);
    const translacaoM = matrizTranslacao(translacao[0], translacao[1], translacao[2]);
    const M = multiplicaMatrizes(MobCabinet, multiplicaMatrizes(translacaoM, multiplicaMatrizes(rotacaoM, escalaM)));

    for (let i = 0; i < objeto[1]; i++){
        const p1 = arestas[i][0];
        const p2 = arestas[i][1];

        const vert1 = [vertices[p1][0] - centroX, vertices[p1][1] - centroY, vertices[p1][2] - centroZ, 1];
        const vert2 = [vertices[p2][0] - centroX, vertices[p2][1] - centroY, vertices[p2][2] - centroZ, 1];
        const res1 = [0, 0, 0, 0];
        const res2 = [0, 0, 0, 0];

        for (let j = 0; j < 4; j++){
            for (let k = 0; k < 4; k++){
                res1[j] += M[j][k] * vert1[k];
                res2[j] += M[j][k] * vert2[k];
            }
        }

        const x1final = centroCanvasX + res1[0] * 75;
        const x2final = centroCanvasX + res2[0] * 75;
        const y1final = centroCanvasY - res1[1] * 75;
        const y2final = centroCanvasY - res2[1] * 75;

        linhaDDA(x1final, y1final, x2final, y2final, blackColor());
    }
}

function projOrtografica(objeto){ // Função para projeção ortográfica ortográfica
    const vertices = objeto[2];
    const arestas = objeto[3];
    const translacao = objeto[4];
    const rotacao = objeto[5];
    const escala = objeto[6];

    const todosX = vertices.map(v => v[0]);
    const todosY = vertices.map(v => v[1]);
    const todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

    const centroCanvasX = canvas.width / 2;
    const centroCanvasY = canvas.height / 2;

    const escalaM = matrizEscala(escala[0], escala[1], escala[2]);
    const rotacaoM = matrizRotacao(rotacao[0], rotacao[1], rotacao[2]);
    const translacaoM = matrizTranslacao(translacao[0], translacao[1], translacao[2]);
    const M = multiplicaMatrizes(MobOrtografica, multiplicaMatrizes(translacaoM, multiplicaMatrizes(rotacaoM, escalaM)));

    for (let i = 0; i < objeto[1]; i++){
        const p1 = arestas[i][0];
        const p2 = arestas[i][1];

        const vert1 = [vertices[p1][0] - centroX, vertices[p1][1] - centroY, vertices[p1][2] - centroZ, 1];
        const vert2 = [vertices[p2][0] - centroX, vertices[p2][1] - centroY, vertices[p2][2] - centroZ, 1];
        const res1 = [0, 0, 0, 0];
        const res2 = [0, 0, 0, 0];

        for (let j = 0; j < 4; j++){
            for (let k = 0; k < 4; k++){
                res1[j] += M[j][k] * vert1[k];
                res2[j] += M[j][k] * vert2[k];
            }
        }

        const x1final = centroCanvasX + res1[0] * 75;
        const x2final = centroCanvasX + res2[0] * 75;
        const y1final = centroCanvasY - res1[1] * 75;
        const y2final = centroCanvasY - res2[1] * 75;

        linhaDDA(x1final, y1final, x2final, y2final, blackColor());
    }
}

function projPersp1(objeto){ // Função para perspectiva com 1 ponto de fuga no eixo Z
    const vertices = objeto[2];
    const arestas = objeto[3];
    const translacao = objeto[4];
    const rotacao = objeto[5];
    const escala = objeto[6];

    const todosX = vertices.map(v => v[0]);
    const todosY = vertices.map(v => v[1]);
    const todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

    const centroCanvasX = canvas.width / 2;
    const centroCanvasY = canvas.height / 2;

    const escalaM = matrizEscala(escala[0], escala[1], escala[2]);
    const rotacaoM = matrizRotacao(rotacao[0], rotacao[1], rotacao[2]);
    const translacaoM = matrizTranslacao(translacao[0], translacao[1], translacao[2]);
    const M = multiplicaMatrizes(MPersp1, multiplicaMatrizes(translacaoM, multiplicaMatrizes(rotacaoM, escalaM)));

    for (let i = 0; i < objeto[1]; i++){
        const p1 = arestas[i][0];
        const p2 = arestas[i][1];

        const vert1 = [vertices[p1][0] - centroX, vertices[p1][1] - centroY, vertices[p1][2] - centroZ, 1];
        const vert2 = [vertices[p2][0] - centroX, vertices[p2][1] - centroY, vertices[p2][2] - centroZ, 1];
        const res1 = [0, 0, 0, 0];
        const res2 = [0, 0, 0, 0];

        for (let j = 0; j < 4; j++){
            for (let k = 0; k < 4; k++){
                res1[j] += M[j][k] * vert1[k];
                res2[j] += M[j][k] * vert2[k];
            }
        }

        const x1final = centroCanvasX + (res1[0] / res1[3]) * 75;
        const x2final = centroCanvasX + (res2[0] / res2[3]) * 75;
        const y1final = centroCanvasY - (res1[1] / res1[3]) * 75;
        const y2final = centroCanvasY - (res2[1] / res2[3]) * 75;

        linhaDDA(x1final, y1final, x2final, y2final, blackColor());
    }
}

function projPersp2(objeto){ // Função para perspectiva com 2 pontos de fuga nos eixos X e Z
    const vertices = objeto[2];
    const arestas = objeto[3];
    const translacao = objeto[4];
    const rotacao = objeto[5];
    const escala = objeto[6];

    const todosX = vertices.map(v => v[0]);
    const todosY = vertices.map(v => v[1]);
    const todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

    const centroCanvasX = canvas.width / 2;
    const centroCanvasY = canvas.height / 2;

    const escalaM = matrizEscala(escala[0], escala[1], escala[2]);
    const rotacaoM = matrizRotacao(rotacao[0], rotacao[1], rotacao[2]);
    const translacaoM = matrizTranslacao(translacao[0], translacao[1], translacao[2]);
    const M = multiplicaMatrizes(MPersp2, multiplicaMatrizes(translacaoM, multiplicaMatrizes(rotacaoM, escalaM)));

    for (let i = 0; i < objeto[1]; i++){
        const p1 = arestas[i][0];
        const p2 = arestas[i][1];

        const vert1 = [vertices[p1][0] - centroX, vertices[p1][1] - centroY, vertices[p1][2] - centroZ, 1];
        const vert2 = [vertices[p2][0] - centroX, vertices[p2][1] - centroY, vertices[p2][2] - centroZ, 1];
        const res1 = [0, 0, 0, 0];
        const res2 = [0, 0, 0, 0];

        for (let j = 0; j < 4; j++){
            for (let k = 0; k < 4; k++){
                res1[j] += M[j][k] * vert1[k];
                res2[j] += M[j][k] * vert2[k];
            }
        }

        const x1final = centroCanvasX + (res1[0] / res1[3]) * 75;
        const x2final = centroCanvasX + (res2[0] / res2[3]) * 75;
        const y1final = centroCanvasY - (res1[1] / res1[3]) * 75;
        const y2final = centroCanvasY - (res2[1] / res2[3]) * 75;

        linhaDDA(x1final, y1final, x2final, y2final, blackColor());
    }
}

function blackColor(){ // Função para gerar cor preta
    return "#000000";
}

function putPixel (x, y, color){ // Função para desenhar um ponto
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 2, 2);
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

function closeWindow(){ // Função para fechar a aplicação
    alert("Aplicação encerrada!")
    window.close();
}

function update(){ // Função de atualização
    if (keys["escape"]){
        closeWindow();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (objeto){
        atualizaEscala(objeto);
        atualizaRotacao(objeto);
        atualizaTranslacao(objeto);

        if (indiceProj === 0) {
            projCavalera(objeto);
        } 
        else if (indiceProj === 1) {
            projCabinet(objeto);
        } 
        else if (indiceProj === 2) {
            projOrtografica(objeto);
        } 
        else if (indiceProj === 3) {
            projPersp1(objeto);
        } 
        else if (indiceProj === 4) {
            projPersp2(objeto);
        }
    }

    divNomeProjecao.textContent = projecoes[indiceProj];

    requestAnimationFrame(update);
}

update();