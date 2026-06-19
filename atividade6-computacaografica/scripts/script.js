// Configuração inicial do canvas
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let keys = {}; // Objeto para teclado

let divAjuda = document.querySelector("#ajuda"); // Popup de ajuda
let divNomeProjecao = document.querySelector("#nome-projecao");

// Lista de projeções disponíveis (tecla P para alternar)
const projecoes = [
    "Paralela Obliqua Cavaleira",
    "Paralela Obliqua Cabinet",
    "Paralela Ortografica Isometrica",
    "Perspectiva com um ponto de fuga em Z",
    "Perspectiva com dois pontos de fuga, em X e em Z",
];
let indiceProj = 0; // índice da projeção ativa

// Eventos de teclado
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

    // Seleção circular de objetos (Atividade 6)
    if (e.key === "Tab") {
        e.preventDefault();
        if (listaObjetos.length > 0) {
            if (e.shiftKey) {
                indiceSelecionado = (indiceSelecionado - 1 + listaObjetos.length) % listaObjetos.length;
            } else {
                indiceSelecionado = (indiceSelecionado + 1) % listaObjetos.length;
            }
        }
        return;
    }

    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Primitivas de desenho 2D
function putPixel(x, y, color){ // Função de desenha de 1 pixel
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 2, 2);
}

function linhaDDA(x1, y1, x2, y2, color){ // Algoritmo DDA
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);

    const incX = dx / steps;
    const incY = dy / steps;

    putPixel(x1, y1, color);

    for(let i = 0; i < steps; i++){
        x1 += incX;
        y1 += incY;
        putPixel(x1, y1, color);
    }
}

// Matrizes de projeção
const MobCavaleira = [ // Cavaleira: ângulo 45°, l = 1, Arakaki (PUC-SP)
    [1, 0, -1 * Math.cos(Math.PI / 4), 0],
    [0, 1, -1 * Math.sin(Math.PI / 4), 0],
    [0, 0,               0            , 0],
    [0, 0,               0            , 1]
];

const MobCabinet = [ // Cabinet: ângulo 63,4°, l = 0.5, Arakaki (PUC-SP)
    [1, 0, -0.5 * Math.cos(63.4 * Math.PI / 180), 0],
    [0, 1, -0.5 * Math.sin(63.4 * Math.PI / 180), 0],
    [0, 0,               0                       , 0],
    [0, 0,               0                       , 1]
];

const MobIsometrica = [ // Isométrica: Mortho · Rx(-35,264°) · Ry(45°), Bruno (UFLA)
    [ Math.sqrt(2)/2,    0,           Math.sqrt(2)/2,  0],
    [-Math.sqrt(6)/6,    Math.sqrt(6)/3, Math.sqrt(6)/6, 0],
    [ 0,                 0,           0,               0],
    [ 0,                 0,           0,               1]
];

const d = 200; // distância focal para perspectiva com 1 ponto de fuga
const MPersp1 = [
    [1, 0,   0, 0],
    [0, 1,   0, 0],
    [0, 0,   0, 0],
    [0, 0, 1/d, 1]
];

const dx = 200, dz = 200; // distâncias focais para perspectiva com 2 pontos de fuga
const MPersp2 = [
    [    1, 0,    0, 0],
    [    0, 1,    0, 0],
    [    0, 0,    1, 0],
    [1/dx, 0, 1/dz, 1]
];

// Álgebra linear (matrizes 4x4)
function multiplicaMatrizes(a, b){ // Método de multiplicação de matrizes
    const m = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
            for (let k = 0; k < 4; k++)
                m[i][j] += a[i][k] * b[k][j];
    return m;
}

function matrizEscala(sx, sy, sz){ // Matriz para execução de escala 
    return [
        [sx,  0,  0, 0],
        [ 0, sy,  0, 0],
        [ 0,  0, sz, 0],
        [ 0,  0,  0, 1]
    ];
}

function matrizRotacaoX(anguloRad){ // Matriz para matriz de rotação no eixo X
    return [
        [1,                    0,                     0, 0],
        [0,  Math.cos(anguloRad), -Math.sin(anguloRad), 0],
        [0,  Math.sin(anguloRad),  Math.cos(anguloRad), 0],
        [0,                    0,                     0, 1]
    ];
}

function matrizRotacaoY(anguloRad){ // Matriz para matriz de rotação no eixo Y
    return [
        [ Math.cos(anguloRad), 0, Math.sin(anguloRad), 0],
        [                   0, 1,                    0, 0],
        [-Math.sin(anguloRad), 0, Math.cos(anguloRad), 0],
        [                   0, 0,                    0, 1]
    ];
}

function matrizRotacaoZ(anguloRad){ // Matriz para matriz de rotação no eixo Z
    return [
        [Math.cos(anguloRad), -Math.sin(anguloRad), 0, 0],
        [Math.sin(anguloRad),  Math.cos(anguloRad), 0, 0],
        [                  0,                     0, 1, 0],
        [                  0,                     0, 0, 1]
    ];
}

function matrizRotacao(rx, ry, rz){ // Combina Rx, Ry e Rz numa única matriz: Rz · Ry · Rx
    const Rx = matrizRotacaoX(rx * Math.PI / 180);
    const Ry = matrizRotacaoY(ry * Math.PI / 180);
    const Rz = matrizRotacaoZ(rz * Math.PI / 180);
    return multiplicaMatrizes(Rz, multiplicaMatrizes(Ry, Rx));
}

function matrizTranslacao(tx, ty, tz){ // Matriz para matriz de transalação
    return [
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0,  1]
    ];
}

// Transformações via teclado (aplicadas ao objeto selecionado)
function atualizaEscala(objeto){ // Função para atualizar de escala
    const escala = objeto.escala;
    const passo = 0.5;
    if (keys["a"]) escala[0] += passo;
    if (keys["z"]) escala[0] -= passo;
    if (keys["s"]) escala[1] += passo;
    if (keys["x"]) escala[1] -= passo;
    if (keys["d"]) escala[2] += passo;
    if (keys["c"]) escala[2] -= passo;
}

function atualizaRotacao(objeto){ // Função para atualização de rotação
    const rotacao = objeto.rotacao;
    const passo = 1.0;
    if (keys["f"]) rotacao[0] += passo;
    if (keys["v"]) rotacao[0] -= passo;
    if (keys["g"]) rotacao[1] += passo;
    if (keys["b"]) rotacao[1] -= passo;
    if (keys["h"]) rotacao[2] += passo;
    if (keys["n"]) rotacao[2] -= passo;
}

function atualizaTranslacao(objeto){ // Função para atualização de translação
    const translacao = objeto.translacao;
    const passo = 1.0;
    if (keys["j"]) translacao[0] += passo;
    if (keys["m"]) translacao[0] -= passo;
    if (keys["k"]) translacao[1] += passo;
    if (keys[","]) translacao[1] -= passo;
    if (keys["l"]) translacao[2] += passo;
    if (keys["."]) translacao[2] -= passo;
}

// Projeções 3D — M = Mob · T · R · S
function projCavalera(objeto, cor){
    const { vertices, arestas, translacao, rotacao, escala } = objeto;
    const todosX = vertices.map(v => v[0]), todosY = vertices.map(v => v[1]), todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const M = multiplicaMatrizes(MobCavaleira, multiplicaMatrizes(
        matrizTranslacao(translacao[0], translacao[1], translacao[2]),
        multiplicaMatrizes(matrizRotacao(rotacao[0], rotacao[1], rotacao[2]),
        matrizEscala(escala[0], escala[1], escala[2]))));

    for (let i = 0; i < arestas.length; i++){
        const v1 = [vertices[arestas[i][0]][0]-centroX, vertices[arestas[i][0]][1]-centroY, vertices[arestas[i][0]][2]-centroZ, 1];
        const v2 = [vertices[arestas[i][1]][0]-centroX, vertices[arestas[i][1]][1]-centroY, vertices[arestas[i][1]][2]-centroZ, 1];
        const r1 = [0,0,0,0], r2 = [0,0,0,0];
        for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++){ r1[j] += M[j][k]*v1[k]; r2[j] += M[j][k]*v2[k]; }
        linhaDDA(cx+r1[0], cy-r1[1], cx+r2[0], cy-r2[1], cor);
    }
}

function projCabinet(objeto, cor){
    const { vertices, arestas, translacao, rotacao, escala } = objeto;
    const todosX = vertices.map(v => v[0]), todosY = vertices.map(v => v[1]), todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const M = multiplicaMatrizes(MobCabinet, multiplicaMatrizes(
        matrizTranslacao(translacao[0], translacao[1], translacao[2]),
        multiplicaMatrizes(matrizRotacao(rotacao[0], rotacao[1], rotacao[2]),
        matrizEscala(escala[0], escala[1], escala[2]))));

    for (let i = 0; i < arestas.length; i++){
        const v1 = [vertices[arestas[i][0]][0]-centroX, vertices[arestas[i][0]][1]-centroY, vertices[arestas[i][0]][2]-centroZ, 1];
        const v2 = [vertices[arestas[i][1]][0]-centroX, vertices[arestas[i][1]][1]-centroY, vertices[arestas[i][1]][2]-centroZ, 1];
        const r1 = [0,0,0,0], r2 = [0,0,0,0];
        for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++){ r1[j] += M[j][k]*v1[k]; r2[j] += M[j][k]*v2[k]; }
        linhaDDA(cx+r1[0], cy-r1[1], cx+r2[0], cy-r2[1], cor);
    }
}

function projOrtografica(objeto, cor){
    const { vertices, arestas, translacao, rotacao, escala } = objeto;
    const todosX = vertices.map(v => v[0]), todosY = vertices.map(v => v[1]), todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const M = multiplicaMatrizes(MobIsometrica, multiplicaMatrizes(
        matrizTranslacao(translacao[0], translacao[1], translacao[2]),
        multiplicaMatrizes(matrizRotacao(rotacao[0], rotacao[1], rotacao[2]),
        matrizEscala(escala[0], escala[1], escala[2]))));

    for (let i = 0; i < arestas.length; i++){
        const v1 = [vertices[arestas[i][0]][0]-centroX, vertices[arestas[i][0]][1]-centroY, vertices[arestas[i][0]][2]-centroZ, 1];
        const v2 = [vertices[arestas[i][1]][0]-centroX, vertices[arestas[i][1]][1]-centroY, vertices[arestas[i][1]][2]-centroZ, 1];
        const r1 = [0,0,0,0], r2 = [0,0,0,0];
        for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++){ r1[j] += M[j][k]*v1[k]; r2[j] += M[j][k]*v2[k]; }
        linhaDDA(cx+r1[0], cy-r1[1], cx+r2[0], cy-r2[1], cor);
    }
}

function projPersp1(objeto, cor){ // 1 ponto de fuga no eixo Z
    const { vertices, arestas, translacao, rotacao, escala } = objeto;
    const todosX = vertices.map(v => v[0]), todosY = vertices.map(v => v[1]), todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const M = multiplicaMatrizes(MPersp1, multiplicaMatrizes(
        matrizTranslacao(translacao[0], translacao[1], 0),
        multiplicaMatrizes(matrizRotacao(rotacao[0], rotacao[1], rotacao[2]),
        matrizEscala(escala[0], escala[1], escala[2]))));

    for (let i = 0; i < arestas.length; i++){
        const v1 = [vertices[arestas[i][0]][0]-centroX, vertices[arestas[i][0]][1]-centroY, vertices[arestas[i][0]][2]-centroZ, 1];
        const v2 = [vertices[arestas[i][1]][0]-centroX, vertices[arestas[i][1]][1]-centroY, vertices[arestas[i][1]][2]-centroZ, 1];
        const r1 = [0,0,0,0], r2 = [0,0,0,0];
        for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++){ r1[j] += M[j][k]*v1[k]; r2[j] += M[j][k]*v2[k]; }
        linhaDDA(cx+r1[0]/r1[3], cy-r1[1]/r1[3], cx+r2[0]/r2[3], cy-r2[1]/r2[3], cor);
    }
}

function projPersp2(objeto, cor){ // 2 pontos de fuga nos eixos X e Z
    const { vertices, arestas, translacao, rotacao, escala } = objeto;
    const todosX = vertices.map(v => v[0]), todosY = vertices.map(v => v[1]), todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const M = multiplicaMatrizes(MPersp2, multiplicaMatrizes(
        matrizTranslacao(translacao[0], translacao[1], 0),
        multiplicaMatrizes(matrizRotacao(rotacao[0], rotacao[1], rotacao[2]),
        matrizEscala(escala[0], escala[1], escala[2]))));

    for (let i = 0; i < arestas.length; i++){
        const v1 = [vertices[arestas[i][0]][0]-centroX, vertices[arestas[i][0]][1]-centroY, vertices[arestas[i][0]][2]-centroZ, 1];
        const v2 = [vertices[arestas[i][1]][0]-centroX, vertices[arestas[i][1]][1]-centroY, vertices[arestas[i][1]][2]-centroZ, 1];
        const r1 = [0,0,0,0], r2 = [0,0,0,0];
        for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++){ r1[j] += M[j][k]*v1[k]; r2[j] += M[j][k]*v2[k]; }
        linhaDDA(cx+r1[0]/r1[3], cy-r1[1]/r1[3], cx+r2[0]/r2[3], cy-r2[1]/r2[3], cor);
    }
}

function closeWindow(){ // Encerrar aplicação
    alert("Aplicação encerrada!");
    window.close();
}

// Estrutura de dados 3D
function criarObjeto3D(nome){
    return {
        nome: nome,
        vertices: [],
        arestas: [],
        faces: [],
        rotacao: [],
        escala: [],
        translacao: [],
    };
}

function copiarLista(lista){ // Copia um array item a item e devolve um novo array.
    const nova = [];

    for (let i = 0; i < lista.length; i++){
        nova[i] = lista[i];
    } 
        
    return nova;
}

function criarFace(indices, cor){
    return {
        indices: copiarLista(indices), // índices (base 0) dos vértices, sentido anti-horário
        cor: copiarLista(cor),         // [R, G, B], cada componente em [0.0, 1.0]
        zMedio: 0.0,                   // média da coordenada Z dos vértices da face
    };
}

function adicionarFace(objeto, indices, cor){
    const face = criarFace(indices, cor);

    if (objeto.vertices.length > 0){
        calcularZMedioFace(objeto, face);
    } 

    objeto.faces.push(face);

    return face;
}

function calcularZMedioFace(objeto, face){
    let soma = 0;

    for (let i = 0; i < face.indices.length; i++){
        soma += objeto.vertices[face.indices[i]][2];
    }

    face.zMedio = soma / face.indices.length;

    return face.zMedio;
}

// Leitura do arquivo figure.dat
function lerArquivoFigura(texto) {
    const objetos = [];
    let linhas = texto.trim().split('\n');
    let indexL = 0;

    function proximaLinhaValida() {
        while (indexL < linhas.length) {
            let l = linhas[indexL].trim();
            indexL++;
            if (l.length > 0) return l;
        }
        return null;
    }

    // Nome da figura e área do universo
    let nomeFigura = proximaLinhaValida().substring(1).trim();
    if (nomeFigura.startsWith('#')) nomeFigura = nomeFigura.substring(1).trim();
    let areaUniverso = proximaLinhaValida().split(/\s+/).map(Number);
    let qtdObjetos = parseInt(proximaLinhaValida());

    for (let o = 0; o < qtdObjetos; o++) {
        let nomeObj = proximaLinhaValida().replace('#', '').trim();
        let novoObjeto = criarObjeto3D(nomeObj);

        let plf = proximaLinhaValida().split(/\s+/).map(Number);
        let nPontos = plf[0], nLinhas = plf[1], nFaces = plf[2];

        for (let i = 0; i < nPontos; i++) {
            let p = proximaLinhaValida().split(/\s+/).map(Number);
            novoObjeto.vertices.push([p[0], p[1], p[2]]);
        }

        for (let i = 0; i < nLinhas; i++) {
            let aresta = proximaLinhaValida().split(/\s+/).map(Number);
            novoObjeto.arestas.push([aresta[0] - 1, aresta[1] - 1]); // base 1 → base 0
        }

        for (let i = 0; i < nFaces; i++) {
            let dadosFace = proximaLinhaValida().split(/\s+/).map(Number);
            let qtdVerts = dadosFace[0];
            let indicesFace = [];
            for (let v = 1; v <= qtdVerts; v++){
                let idx = dadosFace[v] - 1; // base 1 → base 0
                if (idx < 0 || isNaN(idx)) idx = 0;
                indicesFace.push(idx);
            }
            let r = dadosFace[dadosFace.length - 3];
            let g = dadosFace[dadosFace.length - 2];
            let b = dadosFace[dadosFace.length - 1];
            adicionarFace(novoObjeto, indicesFace, [r, g, b]);
        }

        let rot   = proximaLinhaValida().split(/\s+/).map(Number);
        let esc   = proximaLinhaValida().split(/\s+/).map(Number);
        let trans = proximaLinhaValida().split(/\s+/).map(Number);
        novoObjeto.rotacao    = [rot[0],   rot[1],   rot[2]];
        novoObjeto.escala     = [esc[0],   esc[1],   esc[2]];
        novoObjeto.translacao = [trans[0], trans[1], trans[2]];

        objetos.push(novoObjeto);
    }

    return { nome: nomeFigura, universo: areaUniverso, objetos: objetos };
}

// Estado global (Atividade 6)
let listaObjetos = [];
let indiceSelecionado = 0;
let informacoesUniverso = null;

// Carregamento do arquivo no início da execução
fetch("exemplos-arquivos/figure.dat")
    .then(response => response.text())
    .then(texto => {
        let dadosCarregados = lerArquivoFigura(texto);
        listaObjetos = dadosCarregados.objetos;
        informacoesUniverso = {
            nome: dadosCarregados.nome,
            dimensoes: dadosCarregados.universo
        };
        indiceSelecionado = 0;
    });

function update(){
    if (keys["escape"]) closeWindow();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (listaObjetos.length > 0){
        const objSelecionado = listaObjetos[indiceSelecionado];
        atualizaEscala(objSelecionado);
        atualizaRotacao(objSelecionado);
        atualizaTranslacao(objSelecionado);

        for (let i = 0; i < listaObjetos.length; i++) {
            const objAtual = listaObjetos[i];
            const corLinha = (i === indiceSelecionado) ? "#ff0000" : "#000000";

            if      (indiceProj === 0) projCavalera(objAtual, corLinha);
            else if (indiceProj === 1) projCabinet(objAtual, corLinha);
            else if (indiceProj === 2) projOrtografica(objAtual, corLinha);
            else if (indiceProj === 3) projPersp1(objAtual, corLinha);
            else if (indiceProj === 4) projPersp2(objAtual, corLinha);
        }
    }

    divNomeProjecao.textContent = projecoes[indiceProj];
    requestAnimationFrame(update);
}

update();