# Parcial 6 — Computação Gráfica

> Visualizador de múltiplos objetos 3D em wireframe com suporte a faces, seleção por teclado e múltiplas projeções geométricas, desenvolvido com HTML, CSS e JavaScript puro.

---

## Sobre o Projeto

Este repositório contém a atividade da **Parcial 6** da disciplina de **Computação Gráfica**, ministrada pelo professor **Hugo Alexandre Dantas do Nascimento** no período **2026/1**, na **Universidade Federal de Goiás — UFG**.

O projeto é uma evolução da Parcial 5, que já contava com renderização em wireframe com DDA, transformações geométricas via teclado e as cinco projeções geométricas. Esta entrega adiciona suporte a múltiplos objetos 3D com faces coloridas, leitura de um arquivo `.dat` via `fetch` e seleção/manipulação individual de objetos.

---

## Enunciado

1. Incluir na estrutura de dados de cada objeto 3D:
   - Lista de faces com índices dos vértices (anti-horário), cor RGB em [0,1] e campo `zMedio` (usado no próximo trabalho)
   - Valores de rotação, escala e translação por objeto

2. Ler automaticamente no início da execução o arquivo `figure.dat` contendo um ou mais objetos 3D

3. Suportar múltiplos objetos com:
   - Lista circular navegável por **TAB** / **SHIFT+TAB**
   - Todos os objetos visíveis simultaneamente
   - Objeto selecionado destacado em vermelho
   - Transformações aplicadas somente ao objeto selecionado

---

## O que foi implementado

### Estrutura de dados

Cada objeto armazena:

```
{
  nome,
  vertices:   [ [x, y, z], ... ],
  arestas:    [ [i, j], ... ],
  faces:      [ { indices, cor: [R, G, B], zMedio }, ... ],
  rotacao:    [rx, ry, rz],
  escala:     [sx, sy, sz],
  translacao: [tx, ty, tz]
}
```

### Leitura do arquivo

O arquivo `figure.dat` é carregado via `fetch` logo na inicialização. O formato inclui:
- Nome da figura e coordenadas do universo (`Xmin Xmax Ymin Ymax`)
- Para cada objeto: nome, pontos, arestas, faces (com cor RGB), rotação, escala e translação

O universo define os limites do sistema de coordenadas. As coordenadas projetadas são mapeadas ao canvas via `fatorX = canvas.width / (Xmax − Xmin)` e `fatorY = canvas.height / (Ymax − Ymin)`.

### Seleção de objetos

`indiceSelecionado` controla qual objeto está ativo. **TAB** incrementa e **SHIFT+TAB** decrementa com retorno circular. O objeto selecionado é desenhado em vermelho; os demais em preto. As operações de escala, rotação e translação afetam apenas o objeto selecionado.

### Projeções

| Projeção | Parâmetros |
|---|---|
| Paralela Oblíqua Cavaleira | `α = 45°`, `l = 1` |
| Paralela Oblíqua Cabinet | `α = 63.4°`, `l = 0.5` |
| Paralela Ortográfica Isométrica | eixos a 30°, cos/sin de π/6 |
| Perspectiva 1 ponto de fuga em Z | `d = 200` |
| Perspectiva 2 pontos de fuga em X e Z | `dx = dz = 200` |

---

## Como Executar

O programa usa `fetch` para carregar `figure.dat`, o que exige um servidor HTTP local. Abrir o `index.html` diretamente no navegador não funciona.

```bash
git clone https://github.com/MDyszy/computacaografica
cd computacaografica/atividade6-computacaografica
# Abra com Live Server (VS Code) ou qualquer servidor local
```

### Formato do arquivo `figure.dat`

```
# Nome da figura
Xmin Xmax Ymin Ymax
n                        ← quantidade de objetos
# Nome do objeto
p l f                    ← quantidade de pontos, arestas e faces
x y z                    ← coordenadas de cada vértice (p linhas)
Pa Pb                    ← índices (base 1) dos extremos de cada aresta (l linhas)
N IP1...IPN R G B        ← face: qtd vértices, índices (base 1), cor RGB em [0,1] (f linhas)
theta_x theta_y theta_z  ← rotação inicial (graus)
Sx Sy Sz                 ← escala inicial
Tx Ty Tz                 ← translação inicial
```

---

## Fontes

1. **Julio Arakaki — Projeções Geométricas (PUC-SP)** — base teórica para as projeções paralelas oblíquas (Cavaleira e Cabinet)
2. **[CompuPhase — Axonometric projections, a technical overview](https://www.compuphase.com/axometr.htm)** — formulação da matriz isométrica com cos(30°)/sin(30°): `x' = (x−z)·cos(30°)`, `y' = y + (x+z)·sin(30°)`, baseada nas normas NEN 2536 e ISO 5456-3
3. **[Wikipedia — Isometric projection](https://en.wikipedia.org/wiki/Isometric_projection)** — definição formal da projeção isométrica e derivação geométrica dos ângulos de 30°
4. **Hugo A. D. do Nascimento — Projeções (UFG)** — base teórica para as matrizes de perspectiva
5. **LLM (Claude — Anthropic)** — auxílio nas matrizes de perspectiva e estrutura de dados

---

## Nota sobre este README

Este arquivo foi **gerado com auxílio de Inteligência Artificial**, especificamente pelo modelo **Claude Sonnet 4.6**.
