// Configuração inicial do canvas
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

// Dimensão do Canvas para a tela inteira
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

    if (e.key === "Tab") {
        e.preventDefault(); // Evita que o navegador mude o foco
        if (listaObjetos.length > 0) {
            if (e.shiftKey) {
                // Volta a seleção
                indiceSelecionado = (indiceSelecionado - 1 + listaObjetos.length) % listaObjetos.length;
            } else {
                // Avança a seleção
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

/*
 * Estrutura de um objeto 3D (criado por criarObjeto3D):
 *
 *   nome        : string     — nome do objeto lido do arquivo (linha "# Nome")
 *   vertices    : number[][] — lista de pontos 3D: [[x, y, z], ...]
 *   arestas     : number[][] — pares de índices de vértices (base 0): [[a, b], ...]
 *   faces       : Face[]     — polígonos do objeto (ver estrutura Face abaixo)
 *   rotacao     : number[3]  — ângulos de rotação em graus: [rx, ry, rz]
 *   escala      : number[3]  — fatores de escala: [sx, sy, sz]
 *   translacao  : number[3]  — deslocamento no espaço: [tx, ty, tz]
 *
 * Estrutura de uma Face (criada por criarFace):
 *
 *   indices : number[] — índices dos vértices que formam o polígono (base 0, sentido anti-horário)
 *   cor     : number[3] — cor RGB normalizada: [r, g, b] com cada componente em [0.0, 1.0]
 *   zMedio  : number    — média da coordenada Z dos vértices da face (usado para ordenação por profundidade)
 *
 * Estado global:
 *
 *   listaObjetos       : Objeto3D[] — todos os objetos carregados do arquivo .dat
 *   indiceSelecionado  : number     — índice do objeto atualmente selecionado (TAB / SHIFT+TAB)
 *   informacoesUniverso: { nome: string, dimensoes: number[4] }
 *                        nome       — título da figura lido do arquivo
 *                        dimensoes  — área do universo: [xmin, xmax, ymin, ymax]
 */
function criarObjeto3D(nome){
    return {
        nome: nome,
        vertices: [],
        arestas: [],
        faces: [],
        rotacao: [0, 0, 0],
        escala: [1, 1, 1],
        translacao: [0, 0, 0],
    };
}

// Copia uma lista (array) item a item e devolve uma nova lista.
function copiarLista(lista){
    const nova = [];
    for (let i = 0; i < lista.length; i++){
        nova[i] = lista[i];
    }
    return nova;
}

function criarFace(indices, cor){ // Cria a estrutura de uma face
    return {
        indices: copiarLista(indices), // índices (base 0) dos vértices, anti-horário
        cor: copiarLista(cor),         // [R, G, B], cada componente real em [0, 1]
        zMedio: 0.0,                   // posição z média dos vértices (usada no próximo trabalho)
    };
}

// Adiciona uma face ao objeto. Já calcula o zMedio se os vértices já existirem.
function adicionarFace(objeto, indices, cor){
    const face = criarFace(indices, cor);
    if (objeto.vertices.length > 0){
        calcularZMedioFace(objeto, face);
    }
    objeto.faces.push(face);
    return face;
}

// Calcula e guarda a posição z média dos vértices de UMA face.
function calcularZMedioFace(objeto, face){
    let soma = 0;
    for (let i = 0; i < face.indices.length; i++){
        const indice = face.indices[i];
        soma += objeto.vertices[indice][2];
    }
    face.zMedio = soma / face.indices.length;
    return face.zMedio;
}

// Imprime no console TODO o conteúdo do objeto (para depuração).
function imprimirObjeto(objeto){
    console.log("===== Objeto 3D: " + objeto.nome + " =====");

    console.log("Vértices (" + objeto.vertices.length + "):");
    for (let i = 0; i < objeto.vertices.length; i++){
        const v = objeto.vertices[i];
        console.log("  [" + i + "] (" + v[0] + ", " + v[1] + ", " + v[2] + ")");
    }

    console.log("Arestas (" + objeto.arestas.length + "):");
    for (let i = 0; i < objeto.arestas.length; i++){
        const a = objeto.arestas[i];
        console.log("  [" + i + "] " + a[0] + " -> " + a[1]);
    }

    console.log("Faces (" + objeto.faces.length + "):");
    for (let i = 0; i < objeto.faces.length; i++){
        const f = objeto.faces[i];
        console.log("  [" + i + "] indices=" + f.indices + " cor=" + f.cor + " zMedio=" + f.zMedio);
    }

    console.log("Rotação: " + objeto.rotacao);
    console.log("Escala: " + objeto.escala);
    console.log("Translação: " + objeto.translacao);
    console.log("=========================================");
}

function lerArquivoFigura(texto) {
    const objetos = [];
    let linhas = texto.trim().split('\n');
    let indexL = 0;
    
    // Função auxiliar para pular linhas vazias e remover comentários finais
    function proximaLinhaValida() {
        while (indexL < linhas.length) {
            let l = linhas[indexL].trim();
            indexL++;
            if (l.length > 0) return l;
        }
        return null;
    }

    // 1. Lê o nome da figura (ignora o #)
    let nomeFigura = proximaLinhaValida().substring(1).trim();
    if (nomeFigura.startsWith('#')) nomeFigura = nomeFigura.substring(1).trim();

    // 2. Lê a área do universo (xmin, xmax, ymin, ymax)
    let areaUniverso = proximaLinhaValida().split(/\s+/).map(Number);

    // 3. Lê a quantidade de objetos
    let qtdObjetos = parseInt(proximaLinhaValida());

    // 4. Inicia o laço para ler cada um dos objetos
    for (let o = 0; o < qtdObjetos; o++) {
        // Nome do objeto atual
        let nomeObj = proximaLinhaValida().substring(1).trim();
        if (nomeObj.startsWith('#')) nomeObj = nomeObj.substring(1).trim();
        let novoObjeto = criarObjeto3D(nomeObj);

        // Lê P (pontos), L (linhas/arestas), F (faces)
        let plf = proximaLinhaValida().split(/\s+/).map(Number);
        let nPontos = plf[0];
        let nLinhas = plf[1];
        let nFaces = plf[2];

        // Lê Vértices
        for (let i = 0; i < nPontos; i++) {
            let p = proximaLinhaValida().split(/\s+/).map(Number);
            novoObjeto.vertices.push([p[0], p[1], p[2]]);
        }

        // Lê Arestas (Lembrando: Arquivo usa Base 1, JS usa Base 0. Subtraímos 1)
        for (let i = 0; i < nLinhas; i++) {
            let aresta = proximaLinhaValida().split(/\s+/).map(Number);
            novoObjeto.arestas.push([aresta[0] - 1, aresta[1] - 1]);
        }

        // Lê Faces (N IP1 .. IPN R G B)
        for (let i = 0; i < nFaces; i++) {
            let dadosFace = proximaLinhaValida().split(/\s+/).map(Number);
            let qtdVerticesFace = dadosFace[0];
            
            let indicesFace = [];
            // Subtrai 1 de cada índice da face
            for(let v = 1; v <= qtdVerticesFace; v++){
                let idx = dadosFace[v] - 1;
                
                // Se der negativo ou for invalido, trava em 0 para não quebrar a memória
                if (idx < 0 || isNaN(idx)) idx = 0; 
                indicesFace.push(idx);
            }
            
            // As últimas 3 posições são as cores RGB
            let r = dadosFace[dadosFace.length - 3];
            let g = dadosFace[dadosFace.length - 2];
            let b = dadosFace[dadosFace.length - 1];
            
            adicionarFace(novoObjeto, indicesFace, [r, g, b]);
        }

        // Lê Rotação (graus)
        let rot = proximaLinhaValida().split(/\s+/).map(Number);
        novoObjeto.rotacao = [rot[0], rot[1], rot[2]];

        // Lê Escala
        let esc = proximaLinhaValida().split(/\s+/).map(Number);
        novoObjeto.escala = [esc[0], esc[1], esc[2]];

        // Lê Translação (já ajustada para o centro da tela na renderização)
        let trans = proximaLinhaValida().split(/\s+/).map(Number);
        novoObjeto.translacao = [trans[0], trans[1], trans[2]];

        objetos.push(novoObjeto);
    }

    return { nome: nomeFigura, universo: areaUniverso, objetos: objetos };
}

let listaObjetos = [];       // lista de objetos carregados do arquivo
let indiceSelecionado = 0;   // índice do objeto atualmente selecionado
let informacoesUniverso = null; // nome e dimensões do universo lidos do arquivo

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

const MobIsometrica = [ // Projeção isométrica: Mortho · Rx(-35,264°) · Ry(45°)
    [ Math.sqrt(2)/2,           0,  Math.sqrt(2)/2, 0],
    [-Math.sqrt(6)/6, Math.sqrt(6)/3,  Math.sqrt(6)/6, 0],
    [ 0,               0,              0,              0],
    [ 0,               0,              0,              1]
];

const d = 200; // distância focal para perspectiva 1 ponto de fuga
const MPersp1 = [ // Matriz para perspectiva com 1 ponto de fuga no eixo Z
    [1, 0,   0, 0],
    [0, 1,   0, 0],
    [0, 0,   0, 0],
    [0, 0, 1/d, 1]
];

const dx = 200, dz = 200; // distâncias focais para perspectiva 2 pontos de fuga
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
    const escala = objeto.escala;
    const passoEscala = 0.5;

    if (keys["a"]) escala[0] += passoEscala; 
    if (keys["z"]) escala[0] -= passoEscala; 
    if (keys["s"]) escala[1] += passoEscala; 
    if (keys["x"]) escala[1] -= passoEscala; 
    if (keys["d"]) escala[2] += passoEscala; 
    if (keys["c"]) escala[2] -= passoEscala; 
}

function atualizaRotacao(objeto){ // Aplica os incrementos de rotação conforme as teclas pressionadas
    const rotacao = objeto.rotacao;
    const passoRotacao = 1.0;

    if (keys["f"]) rotacao[0] += passoRotacao; 
    if (keys["v"]) rotacao[0] -= passoRotacao; 
    if (keys["g"]) rotacao[1] += passoRotacao; 
    if (keys["b"]) rotacao[1] -= passoRotacao; 
    if (keys["h"]) rotacao[2] += passoRotacao; 
    if (keys["n"]) rotacao[2] -= passoRotacao; 
}

function atualizaTranslacao(objeto){ // Aplica os incrementos de translação conforme as teclas pressionadas
    const translacao = objeto.translacao;
    const passoTranslacao = 1.0;

    if (keys["j"]) translacao[0] += passoTranslacao; 
    if (keys["m"]) translacao[0] -= passoTranslacao; 
    if (keys["k"]) translacao[1] += passoTranslacao; 
    if (keys[","]) translacao[1] -= passoTranslacao; 
    if (keys["l"]) translacao[2] += passoTranslacao; 
    if (keys["."]) translacao[2] -= passoTranslacao; 
}

function projCavalera(objeto, cor){ // Função para projeção utilizando cavalera
    const vertices = objeto.vertices;
    const arestas = objeto.arestas;
    const translacao = objeto.translacao;
    const rotacao = objeto.rotacao;
    const escala = objeto.escala;

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

    for (let i = 0; i < arestas.length; i++){
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

        const x1final = centroCanvasX + res1[0];
        const x2final = centroCanvasX + res2[0];
        const y1final = centroCanvasY - res1[1];
        const y2final = centroCanvasY - res2[1];

        linhaDDA(x1final, y1final, x2final, y2final, cor);
    }
}

function projCabinet(objeto, cor){ // Função para projeção utilizando cabinet
    const vertices = objeto.vertices;
    const arestas = objeto.arestas;
    const translacao = objeto.translacao;
    const rotacao = objeto.rotacao;
    const escala = objeto.escala;

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

    for (let i = 0; i < arestas.length; i++){
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

        const x1final = centroCanvasX + res1[0];
        const x2final = centroCanvasX + res2[0];
        const y1final = centroCanvasY - res1[1];
        const y2final = centroCanvasY - res2[1];

        linhaDDA(x1final, y1final, x2final, y2final, cor);
    }
}

function projOrtografica(objeto, cor){ // Função para projeção ortográfica
    const vertices = objeto.vertices;
    const arestas = objeto.arestas;
    const translacao = objeto.translacao;
    const rotacao = objeto.rotacao;
    const escala = objeto.escala;

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
    const M = multiplicaMatrizes(MobIsometrica, multiplicaMatrizes(translacaoM, multiplicaMatrizes(rotacaoM, escalaM)));

    for (let i = 0; i < arestas.length; i++){
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

        const x1final = centroCanvasX + res1[0];
        const x2final = centroCanvasX + res2[0];
        const y1final = centroCanvasY - res1[1];
        const y2final = centroCanvasY - res2[1];

        linhaDDA(x1final, y1final, x2final, y2final, cor);
    }
}

function projPersp1(objeto, cor){ // Função para perspectiva com 1 ponto de fuga no eixo Z
    const vertices = objeto.vertices;
    const arestas = objeto.arestas;
    const translacao = objeto.translacao;
    const rotacao = objeto.rotacao;
    const escala = objeto.escala;

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
    const translacaoM = matrizTranslacao(translacao[0], translacao[1], 0);
    const M = multiplicaMatrizes(MPersp1, multiplicaMatrizes(translacaoM, multiplicaMatrizes(rotacaoM, escalaM)));

    for (let i = 0; i < arestas.length; i++){
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

        const x1final = centroCanvasX + (res1[0] / res1[3]);
        const x2final = centroCanvasX + (res2[0] / res2[3]);
        const y1final = centroCanvasY - (res1[1] / res1[3]);
        const y2final = centroCanvasY - (res2[1] / res2[3]);

        linhaDDA(x1final, y1final, x2final, y2final, cor);
    }
}

function projPersp2(objeto, cor){ // Função para perspectiva com 2 pontos de fuga nos eixos X e Z
    const vertices = objeto.vertices;
    const arestas = objeto.arestas;
    const translacao = objeto.translacao;
    const rotacao = objeto.rotacao;
    const escala = objeto.escala;

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
    const translacaoM = matrizTranslacao(translacao[0], translacao[1], 0);
    const M = multiplicaMatrizes(MPersp2, multiplicaMatrizes(translacaoM, multiplicaMatrizes(rotacaoM, escalaM)));

    for (let i = 0; i < arestas.length; i++){
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

        const x1final = centroCanvasX + (res1[0] / res1[3]);
        const x2final = centroCanvasX + (res2[0] / res2[3]);
        const y1final = centroCanvasY - (res1[1] / res1[3]);
        const y2final = centroCanvasY - (res2[1] / res2[3]);

        linhaDDA(x1final, y1final, x2final, y2final, cor);
    }
}

function putPixel (x, y, color){ // Função para desenhar um ponto
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 2, 2);
}

function linhaDDA(x1, y1, x2, y2, color){ // Desenha linha usando o algoritmo DDA
    const dx = x2 - x1;
    const dy = y2 - y1;
    // o número de passos é o maior deslocamento para garantir sem buracos
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

function closeWindow(){ // Função para fechar a aplicação
    alert("Aplicação encerrada!")
    window.close();
}

function update(){ // Função de atualização
    if (keys["escape"]){
        closeWindow();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Só processa se houver objetos carregados na lista
    if (listaObjetos.length > 0){
        
        // 1. Pega APENAS o objeto selecionado para aplicar as transformações
        const objSelecionado = listaObjetos[indiceSelecionado];
        atualizaEscala(objSelecionado);
        atualizaRotacao(objSelecionado);
        atualizaTranslacao(objSelecionado);

        // 2. Desenha TODOS os objetos da lista
        for (let i = 0; i < listaObjetos.length; i++) {
            let objAtual = listaObjetos[i];
            
            // O objeto selecionado fica vermelho, os outros ficam pretos
            let corLinha = (i === indiceSelecionado) ? "#FF0000" : "#000000";

            if (indiceProj === 0) {
                projCavalera(objAtual, corLinha);
            } 
            else if (indiceProj === 1) {
                projCabinet(objAtual, corLinha);
            } 
            else if (indiceProj === 2) {
                projOrtografica(objAtual, corLinha);
            } 
            else if (indiceProj === 3) {
                projPersp1(objAtual, corLinha);
            } 
            else if (indiceProj === 4) {
                projPersp2(objAtual, corLinha);
            }
        }
    }

    divNomeProjecao.textContent = projecoes[indiceProj];

    requestAnimationFrame(update);
}

update();