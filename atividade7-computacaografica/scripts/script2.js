// Tarefa 01 - Configuração inicial
canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

keys = {};
divAjuda = document.querySelector("#ajuda");
divNomeProjecao = document.querySelector("#nome-projecao");

function closeWindow() {
    alert("Aplicação encerrada!");
    window.close();
}

window.addEventListener("keydown", (e) => {
    if (e.key === "F1") {
        e.preventDefault();
        divAjuda.classList.toggle("oculto");
        return;
    }

    if (e.key.toLowerCase() === "p") {
        indiceProj = (indiceProj + 1) % projecoes.length;
        return;
    }

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

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Tarefa 02 
function putPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 2, 2);
}

function linhaDDA(x1, y1, x2, y2, color) { // Algoritmo para desenho de linhas
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

// Tarefa 03 - Preenchimento de polígonos (Scan-Line Fill)
function scanLineFill(positionsVertice, insideColor) {

    // Passo 1 - Montar a tabela de lados
    const tabela = [];
    for (let i = 0; i < positionsVertice.length; i++) {
        p1 = positionsVertice[i];
        p2 = positionsVertice[(i + 1) % positionsVertice.length];

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

    for (let yVarredura = menorY; yVarredura <= maiorY; yVarredura++) {
        intersecoes = [];

        // Passo 2 - Interseção com a linha de varredura
        // Inserção com linha de varredura
        for (let k = 0; k < tabela.length; k++) {
            if (yVarredura < tabela[k].ymin || yVarredura >= tabela[k].ymax) {  // Eliminar lados do polígono que a linha não intercepta 
                continue;                                                      // Considerar apenas uma inserção se o vértice tem ymax para um lado ymin para outro
            }
            if (tabela[k].ymin === tabela[k].ymax) { // Tratamento para linhas horizontais
                continue;
            }

            x = tabela[k].mInv * (yVarredura - tabela[k].ymin) + tabela[k].xymin;
            intersecoes.push(x);
        }

        // Terceiro Passo - Ordenação e Pintura

        // Ordenar o pontos de interseções
        for (let m = 0; m < intersecoes.length - 1; m++) {
            for (let n = 0; n < intersecoes.length - 1 - m; n++) {
                if (intersecoes[n] > intersecoes[n + 1]) {
                    temp = intersecoes[n];
                    intersecoes[n] = intersecoes[n + 1];
                    intersecoes[n + 1] = temp;
                }
            }
        }

        // Alteração inicial (Mostrar script_v1)
        for (let l = 0; l < intersecoes.length - 1; l += 2) {
            xInicio = Math.ceil(intersecoes[l]);
            xFim = Math.floor(intersecoes[l + 1]);
            ctx.fillRect(xInicio, yVarredura, xFim - xInicio + 1, 2);
        }
    }
}

// Tarefa 04 - Transformações geométricas
function multiplicaMatrizes(a, b) {
    const r = [[0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                r[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    return r;
}

function matrizEscala(sx, sy, sz) {
    return [
        [sx, 0, 0, 0],
        [0, sy, 0, 0],
        [0, 0, sz, 0],
        [0, 0, 0, 1]
    ];
}

function matrizTranslacao(tx, ty, tz) {
    return [
        [1, 0, 0, tx],
        [0, 1, 0, ty],
        [0, 0, 1, tz],
        [0, 0, 0, 1]
    ];
}

function matrizRotacaoX(anguloRad) {
    return [
        [1, 0, 0, 0],
        [0, Math.cos(anguloRad), -Math.sin(anguloRad), 0],
        [0, Math.sin(anguloRad), Math.cos(anguloRad), 0],
        [0, 0, 0, 1]
    ];
}

function matrizRotacaoY(anguloRad) {
    return [
        [Math.cos(anguloRad), 0, Math.sin(anguloRad), 0],
        [0, 1, 0, 0],
        [-Math.sin(anguloRad), 0, Math.cos(anguloRad), 0],
        [0, 0, 0, 1]
    ];
}

function matrizRotacaoZ(anguloRad) {
    return [
        [Math.cos(anguloRad), -Math.sin(anguloRad), 0, 0],
        [Math.sin(anguloRad), Math.cos(anguloRad), 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

function matrizRotacao(rx, ry, rz) {
    const Rx = matrizRotacaoX(rx * Math.PI / 180);
    const Ry = matrizRotacaoY(ry * Math.PI / 180);
    const Rz = matrizRotacaoZ(rz * Math.PI / 180);
    return multiplicaMatrizes(Rz, multiplicaMatrizes(Ry, Rx));
}

function atualizaEscala(objeto) {
    const escala = objeto.escala;
    const passo = 0.1;
    if (keys["a"]) { escala[0] += passo; }
    if (keys["z"]) { escala[0] -= passo; }
    if (keys["s"]) { escala[1] += passo; }
    if (keys["x"]) { escala[1] -= passo; }
    if (keys["d"]) { escala[2] += passo; }
    if (keys["c"]) { escala[2] -= passo; }
}

function atualizaRotacao(objeto) {
    const rotacao = objeto.rotacao;
    const passo = 1;
    if (keys["f"]) { rotacao[0] += passo; }
    if (keys["v"]) { rotacao[0] -= passo; }
    if (keys["g"]) { rotacao[1] += passo; }
    if (keys["b"]) { rotacao[1] -= passo; }
    if (keys["h"]) { rotacao[2] += passo; }
    if (keys["n"]) { rotacao[2] -= passo; }
}

function atualizaTranslacao(objeto) {
    const translacao = objeto.translacao;
    const passo = 0.8;
    if (keys["j"]) { translacao[0] += passo; }
    if (keys["m"]) { translacao[0] -= passo; }
    if (keys["k"]) { translacao[1] += passo; }
    if (keys[","]) { translacao[1] -= passo; }
    if (keys["l"]) { translacao[2] += passo; }
    if (keys["."]) { translacao[2] -= passo; }
}

function atualizaZoom() {
    const passo = 1.02; // 2% por frame
    if (keys["+"] || keys["="]) { ZOOM *= passo; }
    if (keys["-"]) { ZOOM /= passo; }
    if (keys["0"]) { ZOOM = 0.5; } // restaura o zoom inicial
    ZOOM = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, ZOOM));
}

// Tarefa 05 - Projeções
const projecoes = [
    "Paralela Obliqua Cavaleira",
    "Paralela Obliqua Cabinet",
    "Paralela Ortografica Isometrica",
    "Perspectiva com um ponto de fuga em Z",
    "Perspectiva com dois pontos de fuga, em X e em Z",
];
let indiceProj = 0;

const MobCavaleira = [ // Arakaki
    [1, 0, 1 * Math.cos(Math.PI / 4), 0],
    [0, 1, 1 * Math.sin(Math.PI / 4), 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1]
];

const MobCabinet = [ // Arakaki
    [1, 0, 0.5 * Math.cos(63.4 * Math.PI / 180), 0],
    [0, 1, 0.5 * Math.sin(63.4 * Math.PI / 180), 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1]
];

const MobIsometrica = [ // CompuPhase
    [Math.cos(Math.PI / 6), 0, -Math.cos(Math.PI / 6), 0],
    [Math.sin(Math.PI / 6), 1, Math.sin(Math.PI / 6), 0],
    [0, 0, 0, 0],
    [0, 0, 0, 1]
];

const d = 200;
const MPersp1 = [ // Matriz de perspectiva para ponto de fuga em Z
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 1 / d, 1]
];

const dx = 200, dz = 200;
const MPersp2 = [ // Matriz de perspectiva para ponto de fuga em X e em Z 
    [1, 0, 0, 0],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [1 / dx, 0, 1 / dz, 1]
];

const configProjecoes = [
    { Mob: MobCavaleira, perspectiva: false },
    { Mob: MobCabinet, perspectiva: false },
    { Mob: MobIsometrica, perspectiva: false },
    { Mob: MPersp1, perspectiva: true },
    { Mob: MPersp2, perspectiva: true },
];

let ZOOM = 0.5;
const ZOOM_MIN = 0.1;
const ZOOM_MAX = 2;

function calculaViewport() {
    const centroCanvasX = canvas.width / 2;
    const centroCanvasY = canvas.height / 2;
    const fatorX = canvas.width / (universo[1] - universo[0]);
    const fatorY = canvas.height / (universo[3] - universo[2]);
    const fator = Math.min(fatorX, fatorY) * ZOOM;

    return { centroCanvasX, centroCanvasY, fator };
}

function dividePerspectiva(valor, w) {
    const EPSILON = 0.0001;
    const divisor = Math.abs(w) < EPSILON ? (w < 0 ? -EPSILON : EPSILON) : w;
    return valor / divisor;
}

function projetarObjeto(objeto, Mob, perspectiva, cor) {
    const { vertices, arestas, escala, rotacao, translacao } = objeto;

    const todosX = vertices.map(v => v[0]);
    const todosY = vertices.map(v => v[1]);
    const todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

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
    const { centroCanvasX, centroCanvasY, fator } = calculaViewport();


    for (let i = 0; i < arestas.length; i++) {
        const p1 = arestas[i][0];
        const p2 = arestas[i][1];

        const vert1 = [vertices[p1][0] - centroX, vertices[p1][1] - centroY, vertices[p1][2] - centroZ, 1];
        const vert2 = [vertices[p2][0] - centroX, vertices[p2][1] - centroY, vertices[p2][2] - centroZ, 1];
        const res1 = [0, 0, 0, 0];
        const res2 = [0, 0, 0, 0];

        for (let j = 0; j < 4; j++) {
            for (let k = 0; k < 4; k++) {
                res1[j] += M[j][k] * vert1[k];
                res2[j] += M[j][k] * vert2[k];
            }
        }

        let x1, y1, x2, y2;
        if (perspectiva) {
            x1 = centroCanvasX + dividePerspectiva(res1[0], res1[3]) * fator;
            y1 = centroCanvasY - dividePerspectiva(res1[1], res1[3]) * fator;
            x2 = centroCanvasX + dividePerspectiva(res2[0], res2[3]) * fator;
            y2 = centroCanvasY - dividePerspectiva(res2[1], res2[3]) * fator;
        } else {
            x1 = centroCanvasX + res1[0] * fator;
            y1 = centroCanvasY - res1[1] * fator;
            x2 = centroCanvasX + res2[0] * fator;
            y2 = centroCanvasY - res2[1] * fator;
        }

        linhaDDA(x1, y1, x2, y2, cor);
    }
}

function desenharEixos(Mob, perspectiva) {
    const COR_EIXOS = "#c0c0c0";
    const TRACO = [8, 6];
    const COMPRIMENTO = 2000;

    const { centroCanvasX, centroCanvasY, fator } = calculaViewport();

    const Mgeo = [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
    const Mproj = multiplicaMatrizes(Mob, Mgeo);

    function transformaPonto(px, py, pz) {
        const v = [px, py, pz, 1];
        const res = [0, 0, 0, 0];
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                res[i] += Mproj[i][j] * v[j];
            }
        }
        return res;
    }

    function paraTela(res) {
        if (perspectiva) {
            return {
                x: centroCanvasX + dividePerspectiva(res[0], res[3]) * fator,
                y: centroCanvasY - dividePerspectiva(res[1], res[3]) * fator
            };
        }
        return {
            x: centroCanvasX + res[0] * fator,
            y: centroCanvasY - res[1] * fator
        };
    }

    function segmentoTracejado(x0, y0, z0, x1, y1, z1) {
        let ra = transformaPonto(x0, y0, z0);
        let rb = transformaPonto(x1, y1, z1);

        if (perspectiva) {
            const EPS = 0.01;
            const wa = ra[3], wb = rb[3];

            if (wa < EPS && wb < EPS) return; // segmento todo atrás do observador

            if (wa < EPS) {          // recorta a ponta A no plano w = EPS
                const t = (EPS - wa) / (wb - wa);
                ra = ra.map((v, i) => v + t * (rb[i] - v));
            } else if (wb < EPS) {   // recorta a ponta B
                const t = (EPS - wb) / (wa - wb);
                rb = rb.map((v, i) => v + t * (ra[i] - v));
            }
        }

        const a = paraTela(ra);
        const b = paraTela(rb);

        ctx.beginPath();
        ctx.setLineDash(TRACO);
        ctx.strokeStyle = COR_EIXOS;
        ctx.lineWidth = 1;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    const L = COMPRIMENTO;
    segmentoTracejado(-L, 0, 0, L, 0, 0);
    segmentoTracejado(0, -L, 0, 0, L, 0);
    segmentoTracejado(0, 0, -L, 0, 0, L);
}

// Tarefa 06 - Múltiplos objetos
listaObjetos = [];
indiceSelecionado = 0;
universo = [];

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
    objeto[0] = 3;

    const resultado = [];
    for (let i = 0; i < qtdObjetos; i++) {
        const nomeObj = linhasArq[objeto[i]].replace('#', '').trim();

        coluna = linhasArq[objeto[i] + 1].split(" ");
        const nPontos = parseInt(coluna[0]), nLinhas = parseInt(coluna[1]), nFaces = parseInt(coluna[2]);

        const pontos = [];
        for (let j = 0; j < nPontos; j++) {
            coluna = linhasArq[objeto[i] + 2 + j].split(" ");
            pontos[j] = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];
        }

        const linhasObj = [];
        for (let j = 0; j < nLinhas; j++) {
            coluna = linhasArq[objeto[i] + 2 + nPontos + j].split(" ");
            linhasObj[j] = [parseInt(coluna[0]) - 1, parseInt(coluna[1]) - 1];
        }

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

        const base = objeto[i] + 2 + nPontos + nLinhas + nFaces;
        coluna = linhasArq[base].split(" ");
        const rotacao = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];
        coluna = linhasArq[base + 1].split(" ");
        const escala = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];
        coluna = linhasArq[base + 2].split(" ");
        const translacao = [parseFloat(coluna[0]), parseFloat(coluna[1]), parseFloat(coluna[2])];

        resultado[i] = {
            nome: nomeObj, vertices: pontos, arestas: linhasObj,
            faces, rotacao, escala, translacao
        };

        objeto[i + 1] = objeto[i] + 5 + nPontos + nLinhas + nFaces;
    }

    return resultado;
}

// Tarefa 07 - Pintura das faces
function produtoVetorial(v1, v2) {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
}

function atualizaFaces(objeto, Mob, perspectiva) {
    const { vertices, faces, escala, rotacao, translacao } = objeto;

    const todosX = vertices.map(v => v[0]);
    const todosY = vertices.map(v => v[1]);
    const todosZ = vertices.map(v => v[2]);
    const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
    const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
    const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

    const Mgeo = multiplicaMatrizes(
        matrizTranslacao(translacao[0], translacao[1], translacao[2]),
        multiplicaMatrizes(
            matrizRotacao(rotacao[0], rotacao[1], rotacao[2]),
            matrizEscala(escala[0], escala[1], escala[2])
        )
    );
    const Mproj = multiplicaMatrizes(Mob, Mgeo);

    const { centroCanvasX, centroCanvasY, fator } = calculaViewport();

    const vert3d = [];
    const vert2d = [];
    for (let j = 0; j < vertices.length; j++) {
        const v = [vertices[j][0] - centroX, vertices[j][1] - centroY, vertices[j][2] - centroZ, 1];

        const r3d = [0, 0, 0, 0];
        for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
                r3d[a] += Mgeo[a][b] * v[b];
            }
        }
        vert3d[j] = r3d;

        const r2d = [0, 0, 0, 0];
        for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
                r2d[a] += Mproj[a][b] * v[b];
            }
        }

        if (perspectiva) {
            vert2d[j] = {
                x: centroCanvasX + dividePerspectiva(r2d[0], r2d[3]) * fator,
                y: centroCanvasY - dividePerspectiva(r2d[1], r2d[3]) * fator
            };
        } else {
            vert2d[j] = {
                x: centroCanvasX + r2d[0] * fator,
                y: centroCanvasY - r2d[1] * fator
            };
        }
    }

    const facesVisiveis = [];
    for (let j = 0; j < faces.length; j++) {
        const face = faces[j];
        const idx = face.indices;

        const p0_2d = vert2d[idx[0]];
        const p1_2d = vert2d[idx[1]];
        const p2_2d = vert2d[idx[2]];

        const v1x = p1_2d.x - p0_2d.x;
        const v1y = p1_2d.y - p0_2d.y;
        const v2x = p2_2d.x - p0_2d.x;
        const v2y = p2_2d.y - p0_2d.y;

        const produtoZ = (v1x * v2y) - (v1y * v2x);
        face.visivel = produtoZ >= 0;

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

// Loop principal
function update() {
    if (keys["escape"]) closeWindow();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (listaObjetos.length > 0) {
        const objSelecionado = listaObjetos[indiceSelecionado];
        atualizaEscala(objSelecionado);
        atualizaRotacao(objSelecionado);
        atualizaTranslacao(objSelecionado);
        atualizaZoom();

        const { Mob, perspectiva } = configProjecoes[indiceProj];

        if (universo.length > 0) {
            desenharEixos(Mob, perspectiva);
        }

        const objetosParaDesenho = [];
        for (let i = 0; i < listaObjetos.length; i++) {
            const facesVisiveis = atualizaFaces(listaObjetos[i], Mob, perspectiva);

            const corContorno = (i === indiceSelecionado) ? "#ff0000" : "#000000";

            for (let j = 0; j < facesVisiveis.length; j++) {
                facesVisiveis[j].corContorno = corContorno;
            }

            const zMedioObjeto = facesVisiveis.length > 0
                ? facesVisiveis.reduce((soma, face) => soma + face.zMedio, 0) / facesVisiveis.length
                : 0;

            objetosParaDesenho.push({
                zMedioObjeto,
                facesVisiveis
            });
        }

        objetosParaDesenho.sort((a, b) => b.zMedioObjeto - a.zMedioObjeto);

        for (let i = 0; i < objetosParaDesenho.length; i++) {
            const facesVisiveis = objetosParaDesenho[i].facesVisiveis;
            facesVisiveis.sort((a, b) => b.zMedio - a.zMedio);

            for (let j = 0; j < facesVisiveis.length; j++) {
                const face = facesVisiveis[j];
                const r = Math.round(face.cor[0] * 255);
                const g = Math.round(face.cor[1] * 255);
                const bC = Math.round(face.cor[2] * 255);

                scanLineFill(face.pontos2D, `rgb(${r}, ${g}, ${bC})`);

                for (let k = 0; k < face.pontos2D.length; k++) {
                    const pAtual = face.pontos2D[k];
                    const pProximo = face.pontos2D[(k + 1) % face.pontos2D.length];

                    linhaDDA(pAtual.x, pAtual.y, pProximo.x, pProximo.y, face.corContorno);
                }
            }
        }

    }

    divNomeProjecao.textContent = projecoes[indiceProj];

    requestAnimationFrame(update);
}

update();
