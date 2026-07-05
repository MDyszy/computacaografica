# Parcial 7 — Computação Gráfica

> Visualizador de múltiplos objetos 3D com faces preenchidas, remoção de faces ocultas, algoritmo do pintor, cinco projeções geométricas e zoom interativo, desenvolvido com HTML, CSS e JavaScript puro.

---

## Sobre o Projeto

Este repositório contém a atividade da **Parcial 7** da disciplina de **Computação Gráfica**, ministrada pelo professor **Hugo Alexandre Dantas do Nascimento** no período **2026/1**, na **Universidade Federal de Goiás — UFG**.

O projeto é uma evolução da Parcial 6, que já contava com múltiplos objetos 3D lidos de arquivo `.dat`, seleção por teclado e as cinco projeções geométricas. Esta entrega adiciona a **pintura das faces** com preenchimento por scan-line, a **remoção de faces ocultas** (back-face culling) e a ordenação de visibilidade pelo **algoritmo do pintor**, usando o campo `zMedio` de cada face.

---

## Enunciado

1. Pintar as faces de cada objeto 3D com sua cor RGB, utilizando um algoritmo de preenchimento de polígonos (scan-line fill)

2. Remover as faces não visíveis de cada objeto (back-face culling), a partir da orientação anti-horária dos vértices das faces

3. Resolver a ordem de exibição das faces visíveis pelo algoritmo do pintor, utilizando o `zMedio` calculado para cada face

4. Manter todas as funcionalidades das parciais anteriores: múltiplos objetos, seleção por TAB, transformações por objeto e as cinco projeções

---

## O que foi implementado

### Pintura das faces (Scan-Line Fill)

Cada face visível é preenchida com sua cor RGB pelo algoritmo de scan-line: montagem da tabela de lados (`ymin`, `ymax`, `x` do `ymin` e inverso do coeficiente angular), varredura linha a linha, cálculo das interseções, ordenação e pintura dos vãos entre pares de interseções. Lados horizontais são descartados e vértices compartilhados são tratados pela convenção `y < ymax`.

### Remoção de faces ocultas (Back-Face Culling)

As faces são definidas com vértices em sentido anti-horário. Após a projeção, o sinal da área do polígono em coordenadas de tela (produto vetorial 2D dos dois primeiros lados) determina a orientação: faces com `produtoZ >= 0` são visíveis. O teste é aplicado em **todas** as projeções — nas perspectivas ele permanece válido porque a divisão por `w` preserva a orientação dos polígonos à frente do observador.

### Algoritmo do pintor

Para cada face visível calcula-se o `zMedio` (média do Z dos vértices após as transformações geométricas). As faces são pintadas da mais distante para a mais próxima (ordem decrescente de `zMedio`), em dois níveis: primeiro os objetos são ordenados pelo `zMedio` médio de suas faces, depois as faces dentro de cada objeto.

### Eixos de referência com recorte

Os eixos X, Y e Z são desenhados tracejados em todas as projeções. Nas perspectivas, os segmentos são recortados em coordenadas homogêneas contra o plano `w = ε` antes da divisão por `w`, evitando o espelhamento de pontos situados atrás do observador (visível especialmente na perspectiva com dois pontos de fuga).

### Zoom interativo

Um fator de zoom multiplicativo é aplicado ao mapeamento universo → canvas, controlado pelo teclado (2% por quadro, com limites mínimo e máximo). O percentual atual é exibido no canto inferior direito da tela.

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

### Projeções

| Projeção | Parâmetros |
|---|---|
| Paralela Oblíqua Cavaleira | `α = 45°`, `l = 1` (projetores a 45° do plano) |
| Paralela Oblíqua Cabinet | `α = 45°`, `l = 0.5` (projetores a 63.4° do plano ⇒ `l = 1/tan(63.4°)`) |
| Paralela Ortográfica Isométrica | eixos a 30°, cos/sin de π/6 |
| Perspectiva 1 ponto de fuga em Z | `d = 200` |
| Perspectiva 2 pontos de fuga em X e Z | `dx = dz = 200` |

---

## Controles

Pressione **F1** dentro da aplicação para ver o painel completo de ajuda.

| Tecla | Ação |
|---|---|
| `P` | Alterna entre as 5 projeções |
| `TAB` / `SHIFT+TAB` | Seleciona o próximo / anterior objeto (destacado em vermelho) |
| `A/Z`, `S/X`, `D/C` | Escala em X, Y e Z do objeto selecionado |
| `F/V`, `G/B`, `H/N` | Rotação em X, Y e Z do objeto selecionado |
| `J/M`, `K/,`, `L/.` | Translação em X, Y e Z do objeto selecionado |
| `+` ou `=` / `-` | Zoom in / zoom out |
| `0` | Restaura o zoom padrão |
| `ESC` | Encerra a aplicação |

---

## Como Executar

O programa usa `fetch` para carregar `figure.dat`, o que exige um servidor HTTP local. Abrir o `index.html` diretamente no navegador não funciona.

```bash
git clone https://github.com/MDyszy/computacaografica
cd computacaografica/atividade7-computacaografica
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
5. **LLM (Claude — Anthropic)** — auxílio nas matrizes de perspectiva, back-face culling, algoritmo do pintor e recorte homogêneo dos eixos

---

## Nota sobre este README

Este arquivo foi **gerado com auxílio de Inteligência Artificial**, especificamente pelo modelo **Claude** (Anthropic).