// =============================================================================
// TAREFA 01 – Desenho livre em Javascript
// Configuração inicial do canvas e variáveis globais de estado
// =============================================================================
canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

keys = {};                // Mapa de teclas pressionadas (usado em T01 em diante)
divAjuda = document.querySelector("#ajuda");           // T04 – Popup de ajuda (F1)
divNomeProjecao = document.querySelector("#nome-projecao"); // T05 – Nome da projeção ativa

// =============================================================================
// TAREFA 06 – Evolução para Múltiplos Objetos
// Lista circular de objetos 3D e índice do objeto selecionado
// =============================================================================
listaObjetos = [];
indiceSelecionado = 0;
universo = []; // [Xmin, Xmax, Ymin, Ymax] – lido do figure.dat

// =============================================================================
// TAREFA 05 – Percepção 3D e Projeções
// Nomes das projeções (exibidos no canto da tela) e índice da ativa.
// A Cavaleira (índice 0) é a projeção padrão, conforme exigido pela tarefa.
// =============================================================================
const projecoes = [
    "Paralela Obliqua Cavaleira",
    "Paralela Obliqua Cabinet",
    "Paralela Ortografica Isometrica",
    "Perspectiva com um ponto de fuga em Z",
    "Perspectiva com dois pontos de fuga, em X e em Z",
];
let indiceProj = 0;

// =============================================================================
// TAREFAS 01, 04, 05, 06 – Listeners de teclado
// Acumula funcionalidades ao longo das tarefas:
//   T01: estrutura base e ESC para fechar
//   T04: F1 exibe ajuda; teclas de transformação registradas no mapa keys
//   T05: P alterna projeção de forma circular
//   T06: TAB / SHIFT+TAB seleciona próximo/anterior objeto da lista
// =============================================================================
window.addEventListener("keydown", (e) => {
    // T04 – Exibe/oculta popup de ajuda
    if (e.key === "F1") {
        e.preventDefault();
        divAjuda.classList.toggle("oculto");
        return;
    }

    // T05 – Alterna projeção circularmente
    if (e.key.toLowerCase() === "p") {
        indiceProj = (indiceProj + 1) % projecoes.length;
        return;
    }

    // T06 – Navega na lista circular de objetos
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

    // T04 – Registra tecla para as funções de transformação
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// =============================================================================
// TAREFA 02 – Desenho aleatório de linhas e círculos
// Primitivas de rasterização: putPixel e linhaDDA.
// Base de todas as funções de desenho das tarefas posteriores.
// =============================================================================

// Desenha um pixel (quadrado 2×2) na posição (x, y) com a cor dada
function putPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 2, 2);
}

// Algoritmo DDA: rasteriza um segmento de (x1,y1) até (x2,y2)
function linhaDDA(x1, y1, x2, y2, color) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.abs(dx) > Math.abs(dy) ? Math.abs(dx) : Math.abs(dy);

    const incX = dx / steps;
    const incY = dy / steps;

    putPixel(x1, y1, color);
    for (let i = 0; i < steps; i++) {
        x1 += incX;
        y1 += incY;
        putPixel(x1, y1, color);
    }
}

// =============================================================================
// TAREFA 03 – Desenho e preenchimento de polígonos
// TAREFA 07 – Pintura das faces (reusa este mesmo algoritmo)
// Preenchimento analítico por linha de varredura (Scan-Line Fill).
// Recebe lista de vértices 2D {x, y} e uma cor de preenchimento.
// =============================================================================
function scanLineFill(positionsVertice, insideColor) {

    // Passo 1 – Monta tabela de lados: ymin, ymax, x@ymin e inverso da inclinação (Δx/Δy)
    const tabela = [];
    for (let i = 0; i < positionsVertice.length; i++) {
        p1 = positionsVertice[i];
        p2 = positionsVertice[(i + 1) % positionsVertice.length]; // fecha o polígono no último vértice

        if (p1.y < p2.y) {
            ymin = p1.y; ymax = p2.y; xymin = p1.x;
        } else {
            ymin = p2.y; ymax = p1.y; xymin = p2.x;
        }

        mInv = (p2.x - p1.x) / (p2.y - p1.y);
        tabela.push({ ymin, ymax, xymin, mInv });
    }

    menorY = Math.ceil(Math.min(...tabela.map(e => e.ymin)));
    maiorY = Math.floor(Math.max(...tabela.map(e => e.ymax)));
    ctx.fillStyle = insideColor;

    // Passo 2 – Para cada linha de varredura, calcula interseções com arestas ativas
    for (let yVarredura = menorY; yVarredura <= maiorY; yVarredura++) {
        intersecoes = [];

        for (let k = 0; k < tabela.length; k++) {
            // Ignora arestas que a linha não intercepta e arestas horizontais
            if (yVarredura < tabela[k].ymin || yVarredura >= tabela[k].ymax) continue;
            if (tabela[k].ymin === tabela[k].ymax) continue;

            x = tabela[k].mInv * (yVarredura - tabela[k].ymin) + tabela[k].xymin;
            intersecoes.push(x);
        }

        // Passo 3 – Ordena interseções (bubble sort) e preenche par a par
        for (let m = 0; m < intersecoes.length - 1; m++) {
            for (let n = 0; n < intersecoes.length - 1 - m; n++) {
                if (intersecoes[n] > intersecoes[n + 1]) {
                    temp = intersecoes[n];
                    intersecoes[n] = intersecoes[n + 1];
                    intersecoes[n + 1] = temp;
                }
            }
        }

        for (let l = 0; l < intersecoes.length - 1; l += 2) {
            xInicio = Math.ceil(intersecoes[l]);
            xFim = Math.floor(intersecoes[l + 1]);
            ctx.fillRect(xInicio, yVarredura, xFim - xInicio + 1, 2);
        }
    }
}

// =============================================================================
// TAREFA 04 – Transformações geométricas de objetos 3D
// Álgebra linear: matrizes 4×4 homogêneas para escala, rotação e translação.
// =============================================================================

function multiplicaMatrizes(a, b) { // Produto de duas matrizes 4×4
    const r = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
    for (let i = 0; i < 4; i++)
        for (let j = 0; j < 4; j++)
            for (let k = 0; k < 4; k++)
                r[i][j] += a[i][k] * b[k][j];
    return r;
}

function matrizEscala(sx, sy, sz) { // Matriz 4×4 de escalonamento
    return [
        [sx,  0,  0, 0],
        [ 0, sy,  0, 0],
        [ 0,  0, sz, 0],
        [ 0,  0,  0, 1]
    ];
}

function matrizTranslacao(tx, ty, tz) { // Matriz 4×4 de translação
    return [
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0,  1]
    ];
}

function matrizRotacaoX(anguloRad) { // Rotação em torno do eixo X
    return [
        [1,                    0,                     0, 0],
        [0,  Math.cos(anguloRad), -Math.sin(anguloRad), 0],
        [0,  Math.sin(anguloRad),  Math.cos(anguloRad), 0],
        [0,                    0,                     0, 1]
    ];
}

function matrizRotacaoY(anguloRad) { // Rotação em torno do eixo Y
    return [
        [ Math.cos(anguloRad), 0, Math.sin(anguloRad), 0],
        [                   0, 1,                    0, 0],
        [-Math.sin(anguloRad), 0, Math.cos(anguloRad), 0],
        [                   0, 0,                    0, 1]
    ];
}

function matrizRotacaoZ(anguloRad) { // Rotação em torno do eixo Z
    return [
        [Math.cos(anguloRad), -Math.sin(anguloRad), 0, 0],
        [Math.sin(anguloRad),  Math.cos(anguloRad), 0, 0],
        [                  0,                     0, 1, 0],
        [                  0,                     0, 0, 1]
    ];
}

// Combinação das três rotações em ordem Z * Y * X (graus → radianos internamente)
function matrizRotacao(rx, ry, rz) {
    const Rx = matrizRotacaoX(rx * Math.PI / 180);
    const Ry = matrizRotacaoY(ry * Math.PI / 180);
    const Rz = matrizRotacaoZ(rz * Math.PI / 180);
    return multiplicaMatrizes(Rz, multiplicaMatrizes(Ry, Rx));
}

// =============================================================================
// TAREFA 04 – Transformações geométricas de objetos 3D
// Leitura do mapa de teclas e atualização dos parâmetros de transformação
// do objeto selecionado. Chamadas a cada frame por update().
//
// Mapeamento:
//   Escala:     A/Z → Sx±   S/X → Sy±   D/C → Sz±
//   Rotação:    F/V → Rx±   G/B → Ry±   H/N → Rz±
//   Translação: J/M → Tx±   K/, → Ty±   L/. → Tz±
// =============================================================================
function atualizaEscala(objeto) {
    const escala = objeto.escala;
    const passo = 0.1;
    if (keys["a"]) escala[0] += passo;
    if (keys["z"]) escala[0] -= passo;
    if (keys["s"]) escala[1] += passo;
    if (keys["x"]) escala[1] -= passo;
    if (keys["d"]) escala[2] += passo;
    if (keys["c"]) escala[2] -= passo;
}

function atualizaRotacao(objeto) {
    const rotacao = objeto.rotacao;
    const passo = 1;
    if (keys["f"]) rotacao[0] += passo;
    if (keys["v"]) rotacao[0] -= passo;
    if (keys["g"]) rotacao[1] += passo;
    if (keys["b"]) rotacao[1] -= passo;
    if (keys["h"]) rotacao[2] += passo;
    if (keys["n"]) rotacao[2] -= passo;
}

function atualizaTranslacao(objeto) {
    const translacao = objeto.translacao;
    const passo = 0.1;
    if (keys["j"]) translacao[0] += passo;
    if (keys["m"]) translacao[0] -= passo;
    if (keys["k"]) translacao[1] += passo;
    if (keys[","]) translacao[1] -= passo;
    if (keys["l"]) translacao[2] += passo;
    if (keys["."]) translacao[2] -= passo;
}

// =============================================================================
// TAREFA 05 – Percepção 3D e Projeções
// Matrizes de projeção – constantes globais calculadas uma única vez.
//   Cavaleira:  ângulo 45°, fator l=1
//   Cabinet:    ângulo 63,4°, fator l=0,5
//   Isométrica: fórmula CompuPhase
//   MPersp1:    1 ponto de fuga em Z (distância focal d=200)
//   MPersp2:    2 pontos de fuga em X e Z (dx=dz=200)
// =============================================================================
const MobCavaleira = [
    [1, 0, -1 * Math.cos(Math.PI / 4), 0],
    [0, 1, -1 * Math.sin(Math.PI / 4), 0],
    [0, 0,                           0, 0],
    [0, 0,                           0, 1]
];

const MobCabinet = [
    [1, 0, -0.5 * Math.cos(63.4 * Math.PI / 180), 0],
    [0, 1, -0.5 * Math.sin(63.4 * Math.PI / 180), 0],
    [0, 0,                                      0, 0],
    [0, 0,                                      0, 1]
];

const MobIsometrica = [
    [ Math.cos(Math.PI / 6), 0, -Math.cos(Math.PI / 6), 0],
    [-Math.sin(Math.PI / 6), 1, -Math.sin(Math.PI / 6), 0],
    [                     0, 0,                       0, 0],
    [                     0, 0,                       0, 1]
];

const d = 200;
const MPersp1 = [
    [1, 0,   0, 0],
    [0, 1,   0, 0],
    [0, 0,   0, 0],
    [0, 0, 1/d, 1]
];

const dx = 200, dz = 200;
const MPersp2 = [
    [    1, 0,    0, 0],
    [    0, 1,    0, 0],
    [    0, 0,    1, 0],
    [1/dx, 0, 1/dz, 1]
];

// Mapa de índice de projeção → { matriz, flag de perspectiva }
// Usado por projetarObjeto() e atualizaFaces() para selecionar a projeção ativa
const configProjecoes = [
    { Mob: MobCavaleira,  perspectiva: false },
    { Mob: MobCabinet,    perspectiva: false },
    { Mob: MobIsometrica, perspectiva: false },
    { Mob: MPersp1,       perspectiva: true  },
    { Mob: MPersp2,       perspectiva: true  },
];

// =============================================================================
// TAREFA 05 – Percepção 3D e Projeções
// TAREFA 06 – Múltiplos Objetos (parâmetro "cor" para destacar o selecionado)
//
// projetarObjeto(): função genérica que substitui as cinco funções proj* anteriores
// (projCavalera, projCabinet, projIsometrica, projPersp1, projPersp2).
// Aplica a pipeline Mob * Translação * Rotação * Escala sobre cada aresta e
// desenha o wireframe com linhaDDA.
// Projeções paralelas usam coordenadas diretas; perspectivas fazem divisão por w.
// =============================================================================
function projetarObjeto(objeto, Mob, perspectiva, cor) {
    const { vertices, arestas, escala, rotacao, translacao } = objeto;

    // Centro geométrico do objeto (para centralizar a transformação na origem)
    const todosX = vertices.map(v => v[0]);
    const todosY = vertices.map(v => v[1]);
    const todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

    // Pipeline completa: Mob * Translação * Rotação * Escala
    const M = multiplicaMatrizes(
        Mob,
        multiplicaMatrizes(
            matrizTranslacao(translacao[0], translacao[1], translacao[2]),
            multiplicaMatrizes(
                matrizRotacao(rotacao[0], rotacao[1], rotacao[2]),
                matrizEscala(escala[0], escala[1], escala[2])
            )
        )
    );

    const centroCanvasX = canvas.width  / 2;
    const centroCanvasY = canvas.height / 2;
    const fatorX = canvas.width  / (universo[1] - universo[0]);
    const fatorY = canvas.height / (universo[3] - universo[2]);

    // Pega o menor fator para garantir que a imagem não estique e caiba na tela
    const fator = Math.min(fatorX, fatorY);

    for (let i = 0; i < arestas.length; i++) {
        const p1 = arestas[i][0];
        const p2 = arestas[i][1];

        // Subtrai o centro para que as transformações ocorram em torno da origem do objeto
        const vert1 = [vertices[p1][0] - centroX, vertices[p1][1] - centroY, vertices[p1][2] - centroZ, 1];
        const vert2 = [vertices[p2][0] - centroX, vertices[p2][1] - centroY, vertices[p2][2] - centroZ, 1];
        const res1 = [0, 0, 0, 0];
        const res2 = [0, 0, 0, 0];

        for (let j = 0; j < 4; j++)
            for (let k = 0; k < 4; k++) {
                res1[j] += M[j][k] * vert1[k];
                res2[j] += M[j][k] * vert2[k];
            }

        let x1, y1, x2, y2;
        if (perspectiva) {
            // Divisão perspectiva: divide pelo componente homogêneo w
            // O fator de escala é aplicado após a divisão para manter a proporção correta na tela
            x1 = centroCanvasX + (res1[0] / res1[3]) * fator;
            y1 = centroCanvasY - (res1[1] / res1[3]) * fator;
            x2 = centroCanvasX + (res2[0] / res2[3]) * fator;
            y2 = centroCanvasY - (res2[1] / res2[3]) * fator;
        } else {
            // O fator de escala é aplicado diretamente para manter a proporção correta na tela
            x1 = centroCanvasX + res1[0] * fator;
            y1 = centroCanvasY - res1[1] * fator;
            x2 = centroCanvasX + res2[0] * fator;
            y2 = centroCanvasY - res2[1] * fator;
        }

        linhaDDA(x1, y1, x2, y2, cor);
    }
}

// =============================================================================
// TAREFA 07 – Pintura das Faces (Linhas e Superfícies Escondidas)
// produtoVetorial(): calcula o produto vetorial de dois vetores 3D.
// Usado em atualizaFaces() para obter o vetor normal de cada face.
// =============================================================================
function produtoVetorial(v1, v2) {
    return [
        v1[1]*v2[2] - v1[2]*v2[1],
        v1[2]*v2[0] - v1[0]*v2[2],
        v1[0]*v2[1] - v1[1]*v2[0]
    ];
}

// =============================================================================
// TAREFA 07 – Pintura das Faces (Linhas e Superfícies Escondidas)
// atualizaFaces(): para cada objeto, aplica as transformações geométricas e:
//   1. Projeta todos os vértices em 3D (para cálculo de normal e zMedio) e em
//      2D (coordenadas de tela, para o scan-line posterior).
//   2. Back-face culling: normal.z >= 0 → face voltada para o observador → visível.
//   3. Calcula zMedio como média das coordenadas Z 3D transformadas da face.
//      Esse valor é usado pelo Algoritmo do Pintor para ordenação por profundidade.
//   4. Retorna apenas as faces visíveis com seus pontos 2D projetados e cor.
// =============================================================================
function atualizaFaces(objeto, Mob, perspectiva) {
    const { vertices, faces, escala, rotacao, translacao } = objeto;

    const todosX = vertices.map(v => v[0]);
    const todosY = vertices.map(v => v[1]);
    const todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

    // Mgeo: apenas geometria (sem projeção) – usado para normal e zMedio em espaço 3D
    // Mproj: pipeline completa (Mob * Mgeo) – usado para coordenadas de tela
    const Mgeo = multiplicaMatrizes(
        matrizTranslacao(translacao[0], translacao[1], translacao[2]),
        multiplicaMatrizes(
            matrizRotacao(rotacao[0], rotacao[1], rotacao[2]),
            matrizEscala(escala[0], escala[1], escala[2])
        )
    );
    const Mproj = multiplicaMatrizes(Mob, Mgeo);

    const centroCanvasX = canvas.width  / 2;
    const centroCanvasY = canvas.height / 2;
    const fatorX = canvas.width  / (universo[1] - universo[0]);
    const fatorY = canvas.height / (universo[3] - universo[2]);

    // Transforma todos os vértices: vert3d (espaço 3D) e vert2d (tela)
    const vert3d = [];
    const vert2d = [];
    for (let j = 0; j < vertices.length; j++) {
        const v = [vertices[j][0] - centroX, vertices[j][1] - centroY, vertices[j][2] - centroZ, 1];

        const r3d = [0, 0, 0, 0];
        for (let a = 0; a < 4; a++)
            for (let b = 0; b < 4; b++)
                r3d[a] += Mgeo[a][b] * v[b];
        vert3d[j] = r3d;

        const r2d = [0, 0, 0, 0];
        for (let a = 0; a < 4; a++)
            for (let b = 0; b < 4; b++)
                r2d[a] += Mproj[a][b] * v[b];

        if (perspectiva) {
            vert2d[j] = { x: centroCanvasX + (r2d[0] / r2d[3]) * fatorX,
                          y: centroCanvasY - (r2d[1] / r2d[3]) * fatorY };
        } else {
            vert2d[j] = { x: centroCanvasX + r2d[0] * fatorX,
                          y: centroCanvasY - r2d[1] * fatorY };
        }
    }

    // Back-face culling e cálculo de zMedio por face
    const facesVisiveis = [];
    for (let j = 0; j < faces.length; j++) {
        const face = faces[j];
        const idx  = face.indices;

        // Pega os vértices já convertidos para coordenadas de tela (2D)
        const p0_2d = vert2d[idx[0]];
        const p1_2d = vert2d[idx[1]];
        const p2_2d = vert2d[idx[2]];

        // Cria os vetores baseados no plano 2D da tela
        const v1x = p1_2d.x - p0_2d.x;
        const v1y = p1_2d.y - p0_2d.y;
        const v2x = p2_2d.x - p0_2d.x;
        const v2y = p2_2d.y - p0_2d.y;

        // Calcula o produto vetorial (determinante) no plano 2D
        const produtoZ = (v1x * v2y) - (v1y * v2x);

        // Se a face desaparecer por completo ou ficar ao contrário, 
        // mude o "<= 0" para ">= 0" (depende da ordem de desenho no seu figure.dat)
        face.visivel = produtoZ <= 0;

        let somaZ = 0;
        for (let k = 0; k < idx.length; k++) somaZ += vert3d[idx[k]][2];
        face.zMedio = somaZ / idx.length;

        if (face.visivel) {
            const pontos2D = idx.map(k => vert2d[k]);
            facesVisiveis.push({ pontos2D, cor: face.cor, zMedio: face.zMedio });
        }
    }

    return facesVisiveis;
}

// =============================================================================
// TAREFA 06 – Evolução para Múltiplos Objetos
// Leitura assíncrona de figure.dat logo no início da execução.
// lerArquivoFigura() faz o parse do formato definido pela tarefa:
//   - Cabeçalho global: nome da figura, universo (Xmin Xmax Ymin Ymax), nº de objetos
//   - Por objeto: nome, contagens (p l f), vértices, arestas, faces (com cor RGB),
//                 rotação, escala e translação iniciais
// =============================================================================
fetch("exemplos-arquivos/figure.dat")
    .then(response => response.text())
    .then(texto => {
        listaObjetos = lerArquivoFigura(texto);
        indiceSelecionado = 0;
    });

function lerArquivoFigura(texto) {
    linhasArq = texto.split("\n").filter(l => l.trim().length > 0);

    coluna = linhasArq[1].split(" ");
    universo = [parseFloat(coluna[0]), parseFloat(coluna[1]),
                parseFloat(coluna[2]), parseFloat(coluna[3])];
    const qtdObjetos = parseInt(linhasArq[2]);

    const objeto = [];
    objeto[0] = 3; // Linha inicial do primeiro objeto (após cabeçalho global de 3 linhas)

    const resultado = [];
    for (let i = 0; i < qtdObjetos; i++) {
        const nomeObj = linhasArq[objeto[i]].replace('#', '').trim();

        coluna = linhasArq[objeto[i] + 1].split(" ");
        const nPontos = parseInt(coluna[0]), nLinhas = parseInt(coluna[1]), nFaces = parseInt(coluna[2]);

        // Vértices: coordenadas (x, y, z)
        const pontos = [];
        for (let j = 0; j < nPontos; j++) {
            coluna = linhasArq[objeto[i] + 2 + j].split(" ");
            pontos[j] = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];
        }

        // Arestas: pares de índices de vértices (base 1 → base 0)
        const linhasObj = [];
        for (let j = 0; j < nLinhas; j++) {
            coluna = linhasArq[objeto[i] + 2 + nPontos + j].split(" ");
            linhasObj[j] = [parseInt(coluna[0]) - 1, parseInt(coluna[1]) - 1];
        }

        // Faces: N índices em sentido anti-horário + cor RGB (campo zMedio inicializado a 0, calculado na T07)
        const faces = [];
        for (let j = 0; j < nFaces; j++) {
            coluna = linhasArq[objeto[i] + 2 + nPontos + nLinhas + j].split(" ");
            const qtdVerts = parseInt(coluna[0]);
            const indices = [];
            for (let k = 1; k <= qtdVerts; k++) indices[k - 1] = parseInt(coluna[k]) - 1;
            faces[j] = {
                indices,
                cor: [parseFloat(coluna[coluna.length - 3]),
                      parseFloat(coluna[coluna.length - 2]),
                      parseFloat(coluna[coluna.length - 1])],
                zMedio: 0
            };
        }

        // Transformações iniciais do objeto (rotação, escala, translação)
        const base = objeto[i] + 2 + nPontos + nLinhas + nFaces;
        coluna = linhasArq[base].split(" ");
        const rotacao    = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];
        coluna = linhasArq[base + 1].split(" ");
        const escala     = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];
        coluna = linhasArq[base + 2].split(" ");
        const translacao = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];

        resultado[i] = { nome: nomeObj, vertices: pontos, arestas: linhasObj,
                         faces, rotacao, escala, translacao };

        objeto[i + 1] = objeto[i] + 5 + nPontos + nLinhas + nFaces;
    }

    return resultado;
}

// =============================================================================
// TAREFA 01 – Desenho livre em Javascript
// Encerra a aplicação (ESC).
// =============================================================================
function closeWindow() {
    alert("Aplicação encerrada!");
    window.close();
}

// =============================================================================
// Eixos de referência (X, Y, Z) – linha tracejada cinza clara
// Projeta segmentos ao longo de cada eixo usando a mesma pipeline de projeção
// ativa no momento (Mob + perspectiva), de modo que os eixos girem e escalem
// junto com a cena. O centro da cena é fixado na origem do canvas.
// Os segmentos são desenhados com ctx.setLineDash para tracejado e
// ctx.lineTo/stroke em vez de linhaDDA, pois o canvas já oferece tracejado
// nativo — não faria sentido reimplementar isso com putPixel.
// =============================================================================
function desenharEixos(Mob, perspectiva) {
    const COR_EIXOS   = "#c0c0c0"; // cinza claro
    const TRACO       = [8, 6];    // [comprimento do traço, comprimento do espaço]
    const COMPRIMENTO = 1.5;       // metade do comprimento de cada eixo, em unidades do universo

    const centroCanvasX = canvas.width  / 2;
    const centroCanvasY = canvas.height / 2;
    const fatorX = canvas.width  / (universo[1] - universo[0]);
    const fatorY = canvas.height / (universo[3] - universo[2]);

    // Os eixos não pertencem a nenhum objeto, portanto não têm transformações
    // de escala/rotação/translação próprias — a matriz geométrica é a identidade,
    // e só a projeção (Mob) é aplicada.
    const Mgeo = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
    const Mproj = multiplicaMatrizes(Mob, Mgeo); // equivale a Mob, mas mantém a simetria com o resto do código

    // Projeta um ponto 3D para coordenadas de tela 2D usando a mesma lógica de projetarObjeto()
    function projetarPonto(px, py, pz) {
        const v   = [px, py, pz, 1];
        const res = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++)
            for (let j = 0; j < 4; j++)
                res[i] += Mproj[i][j] * v[j];

        if (perspectiva) {
            return { x: centroCanvasX + (res[0] / res[3]) * fatorX,
                     y: centroCanvasY - (res[1] / res[3]) * fatorY };
        } else {
            return { x: centroCanvasX + res[0] * fatorX,
                     y: centroCanvasY - res[1] * fatorY };
        }
    }

    // Desenha um segmento tracejado entre dois pontos 3D
    function segmentoTracejado(x0, y0, z0, x1, y1, z1) {
        const a = projetarPonto(x0, y0, z0);
        const b = projetarPonto(x1, y1, z1);

        ctx.beginPath();
        ctx.setLineDash(TRACO);
        ctx.strokeStyle = COR_EIXOS;
        ctx.lineWidth   = 1;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]); // restaura linha sólida para não afetar o resto do desenho
    }

    const L = COMPRIMENTO;
    segmentoTracejado(-L, 0, 0,  L, 0, 0); // eixo X
    segmentoTracejado( 0,-L, 0,  0, L, 0); // eixo Y
    segmentoTracejado( 0, 0,-L,  0, 0, L); // eixo Z
}

// =============================================================================
// TAREFAS 01–07 – Loop principal de atualização e renderização
// Chamado a cada frame via requestAnimationFrame.
//
// Fluxo por frame:
//   T01 – Verifica ESC; limpa o canvas
//   T04 – Aplica transformações do objeto selecionado via teclas
//   T05 – Resolve matriz e flag de perspectiva da projeção ativa
//   T07 – Coleta faces visíveis de todos os objetos, ordena por zMedio
//          (Algoritmo do Pintor: mais distante → mais próximo) e preenche
//          com scanLineFill (T03)
//   T06 – Desenha wireframe de todos os objetos; selecionado em vermelho
//   T05 – Exibe nome da projeção ativa no canto da tela
// =============================================================================
function update() {
    if (keys["escape"]) closeWindow();

    ctx.clearRect(0, 0, canvas.width, canvas.height); // T01 – Limpa o canvas

    // Eixos de referência: desenhados antes de qualquer objeto para ficarem ao fundo.
    // Só são desenhados depois que o universo está carregado (fetch do figure.dat).
    if (universo.length > 0) {
        const { Mob, perspectiva } = configProjecoes[indiceProj];
        desenharEixos(Mob, perspectiva);
    }

    if (listaObjetos.length > 0) {
        // T04 – Transforma apenas o objeto selecionado
        const objSelecionado = listaObjetos[indiceSelecionado];
        atualizaEscala(objSelecionado);
        atualizaRotacao(objSelecionado);
        atualizaTranslacao(objSelecionado);

        // T05 – Obtém configuração da projeção ativa (matriz + flag perspectiva)
        const { Mob, perspectiva } = configProjecoes[indiceProj];

        // T07 – Agrega faces visíveis de todos os objetos (com cor de contorno)
        const todasFaces = [];
        for (let i = 0; i < listaObjetos.length; i++) {
            const facesVisiveis = atualizaFaces(listaObjetos[i], Mob, perspectiva);
    
            // Define a cor do contorno baseado se o objeto está selecionado ou não
            const corContorno = (i === indiceSelecionado) ? "#ff0000" : "#000000";
    
            for (let j = 0; j < facesVisiveis.length; j++) {
            facesVisiveis[j].corContorno = corContorno; // Guarda a cor na face
            todasFaces.push(facesVisiveis[j]);
            }
        }

        // T07 – Algoritmo do Pintor: do mais distante (menor zMedio) ao mais próximo
        todasFaces.sort((a, b) => b.zMedio - a.zMedio);

        // T07 – Preenche cada face e desenha APENAS suas arestas visíveis
        for (let i = 0; i < todasFaces.length; i++) {
            const face = todasFaces[i];
            const r  = Math.round(face.cor[0] * 255);
            const g  = Math.round(face.cor[1] * 255);
            const bC = Math.round(face.cor[2] * 255);
    
            // 1. Pinta a superfície da face
            scanLineFill(face.pontos2D, `rgb(${r}, ${g}, ${bC})`);
    
            // 2. Desenha o contorno dessa face utilizando os pontos 2D dela
            for (let j = 0; j < face.pontos2D.length; j++) {
                const pAtual = face.pontos2D[j];
                const pProximo = face.pontos2D[(j + 1) % face.pontos2D.length]; // Fecha o polígono
        
                linhaDDA(pAtual.x, pAtual.y, pProximo.x, pProximo.y, face.corContorno);
            }
        }
    }

    // T05 – Atualiza o nome da projeção no canto da tela
    divNomeProjecao.textContent = projecoes[indiceProj];

    requestAnimationFrame(update);
}

update(); // T01 – Inicia o loop de renderização