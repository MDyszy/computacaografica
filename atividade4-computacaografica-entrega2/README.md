# Projeção Cavaleira — Computação Gráfica

> Visualizador de objetos 3D em wireframe usando projeção cavaleira, desenvolvido com HTML, CSS e JavaScript puro.

---

## Sobre o Projeto

Este repositório reúne a atividade prática da **Parcial 4** da disciplina de **Computação Gráfica**, ministrada pelo professor **Hugo Alexandre Dantas do Nascimento** no período **2025/1**, na **Universidade Federal de Goiás — UFG**.

Este código é uma evolução direta das atividades anteriores: a base de canvas, o loop com `setTimeout` (Atividade 2 em diante), o sistema de teclas e o algoritmo DDA foram desenvolvidos e refinados ao longo das **Parciais 1, 2 e 3**, e reutilizados aqui com a adição da leitura de arquivos e da projeção 3D.

---

## Parcial 4 — Entrega 1

### Enunciado

Desenvolver um programa em HTML e JavaScript que leia um arquivo `.txt` descrevendo um objeto 3D (vértices e arestas) e o exiba na tela utilizando **projeção cavaleira** (paralela oblíqua).

O formato esperado do arquivo `.txt` é:

```
n          ← número de vértices
m          ← número de arestas
x y z      ← coordenadas de cada vértice (n linhas)
i j        ← índices dos vértices de cada aresta (m linhas)
```

---

### Decisões Técnicas

- O arquivo `.txt` é carregado via `<input type="file">` e lido com a **API FileReader** — o evento `load` dispara após a leitura, e o texto é então parseado linha a linha
- A estrutura do objeto 3D é armazenada como `[n, m, pontos, arestas]`
- A **projeção cavaleira** é implementada por meio da matriz oblíqua `M_ob` (notação do prof. Arakaki), com `l = 1` e `α = 45°`: (l sem variável, descrito apenas como 1)

```
Mob = [ 1,  0,  1·cos(α),  0 ]
      [ 0,  1,  1·sin(α),  0 ]
      [ 0,  0,  0,          0 ]
      [ 0,  0,  0,          1 ]
```

- Cada vértice `[x, y, z, 1]` é multiplicado por `Mob` via dois `for` aninhados, produzindo `xp` e `yp` conforme a fórmula do material:
  - `xp = x + z·(l·cos α)`
  - `yp = y + z·(l·sin α)`
- O eixo Y é invertido ao mapear para o canvas (`cy - yp * escala`), pois o canvas cresce para baixo enquanto o sistema matemático cresce para cima
- As arestas são desenhadas com o algoritmo **DDA**, já utilizado nas parciais anteriores
- O loop principal usa `setTimeout` a cada 100ms e só renderiza quando um objeto foi carregado

---

## Parcial 4 — Entrega 2

Após os feedbacks gerais dados pelo professor, foram identificados dois problemas na entrega anterior:

### Problemas Identificados

**1. Inversão do eixo Z**

A projeção cavaleira estava com a profundidade (eixo Z) projetada no sentido errado — objetos com Z positivo recuavam visualmente em vez de avançar. O problema estava nos sinais dos componentes da terceira coluna da matriz oblíqua `Mob`, que estavam positivos:

```
Mob (incorreta) = [ 1,  0,  1·cos(α),  0 ]
                  [ 0,  1,  1·sin(α),  0 ]
                  ...
```

A correção foi negar esses termos, pois o eixo Z do sistema de coordenadas 3D aponta para fora da tela (convenção destro), e a projeção cavaleira deve deslocar para cima e para a direita conforme Z aumenta — o que exige subtração em relação ao canvas:

```
Mob (correta) = [ 1,  0,  -1·cos(α),  0 ]
                [ 0,  1,  -1·sin(α),  0 ]
                ...
```

**2. Origem não centralizada no centro da figura**

O objeto era renderizado com a origem do sistema de coordenadas (ponto `[0, 0, 0]`) fixada no centro do canvas, o que fazia com que objetos cujos vértices não estivessem centrados em torno da origem aparecessem deslocados na tela.

A correção foi calcular o centro geométrico do objeto antes da projeção — a média entre os valores mínimo e máximo de cada eixo — e subtrair esse centro de todos os vértices, centralizando o objeto em relação à sua própria geometria. Em seguida, as coordenadas projetadas são transladadas para o centro do canvas:

```javascript
const centroX = (Math.min(...todosX) + Math.max(...todosX)) / 2;
const centroY = (Math.min(...todosY) + Math.max(...todosY)) / 2;
const centroZ = (Math.min(...todosZ) + Math.max(...todosZ)) / 2;

// Antes de aplicar Mob:
const vert = [v[0] - centroX, v[1] - centroY, v[2] - centroZ, 1];

// Após projeção, translada para o centro do canvas:
const xFinal = centroCanvasX + res[0] * escala;
const yFinal = centroCanvasY - res[1] * escala;
```

**3. Sobreposição de figuras ao carregar dois arquivos**

Ao carregar um segundo arquivo `.txt` sem limpar o canvas, a nova figura era desenhada sobre a anterior, causando sobreposição visual. A correção foi adicionar `clearRect` no início de cada iteração do loop de renderização, garantindo que o canvas seja limpo antes de desenhar o objeto atual:

---

### Fontes — Entrega 1

1. [Julio Arakaki — Projeções Geométricas (PUC-SP)](https://www.pucsp.br/~jarakaki/cgpi/5_Projecoes.pdf) *(base teórica para a projeção cavaleira e a matriz M_ob)*
2. [YouTube — Manipulação de arquivos com FileReader em JavaScript](https://www.youtube.com/watch?v=SWTJxnms_YA)
3. [MDN Web Docs](https://developer.mozilla.org/en-US/)
4. [YouTube — Cavalier Perspective Drawing of a Cube](https://www.youtube.com/watch?v=81QHZeghWr0)
5. **LLM (Claude — Anthropic)** — utilizado para entendimento de sistema de coordenadas Canvas e geração de arquivo piramide.txt ( Quando feito o exemplo da pirâmide inicialmente, ela estava invertida )

---

### Fontes — Entrega 2

1. [MDN Web Docs — Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map) *(utilizado para pegar todos os pontos de X, Y e Z para utilizar na centralização da origem do centro de coordenadas)*
2. **LLM (Claude — Anthropic)** — geração dos arquivos de teste `cubo-deslocado.txt` e `cubo-dobrado.txt`, utilizados para validar a correção da centralização da origem

---

## Parte 2 da Atividade 4 — Transformações Geométricas

### Enunciado

Estender o visualizador com as operações de **escala**, **rotação** e **translação** aplicadas ao objeto 3D, implementadas por meio de **matrizes de transformação 4×4** e controladas pelo usuário em tempo real via **teclado**.

---

### O que foi alterado

**1. Novo formato do arquivo `.txt`**

O arquivo de entrada passou a conter **três linhas adicionais** ao final, com os valores **iniciais** de translação, rotação e escala:

```
n          ← número de vértices
m          ← número de arestas
x y z      ← coordenadas de cada vértice (n linhas)
i j        ← índices dos vértices de cada aresta (m linhas)
Tx Ty Tz   ← translação inicial
Rx Ry Rz   ← rotação inicial (em graus)
Sx Sy Sz   ← escala inicial
```

A função `criadorEstrutura3D` foi adaptada para ler essas linhas extras a partir do índice `2 + n + m`, e a estrutura do objeto foi expandida de `[n, m, pontos, arestas]` para `[n, m, pontos, arestas, translacao, rotacao, escala]`. O arquivo de exemplo (`cubo.txt`) foram atualizados com `0 0 0` / `0 0 0` / `1 1 1` — ou seja, sem transformação inicial.

**2. Matrizes de transformação 4×4**

Foram adicionadas as funções que montam cada matriz de transformação:

- `matrizEscala(sx, sy, sz)` — escala nos três eixos (diagonal principal)
- `matrizRotacaoX / matrizRotacaoY / matrizRotacaoZ(anguloRad)` — rotação em torno de cada eixo
- `matrizRotacao(rx, ry, rz)` — combina as três rotações em `Rz · Ry · Rx` (ângulos em graus, convertidos para radianos)
- `matrizTranslacao(tx, ty, tz)` — translação, com os deslocamentos na **4ª coluna** (válido porque o vértice usa coordenada homogênea `w = 1`)
- `multiplicaMatrizes(a, b)` — multiplicação genérica de duas matrizes 4×4 com três `for` aninhados

> **Observação sobre as rotações:** as matrizes de rotação do material do professor são escritas no formato *vetor × matriz*. Como este projeto multiplica *matriz × vetor*, elas entram **transpostas** no código, de modo que o sentido do giro seja o mesmo do slide.

**3. Matriz composta**

Em `projCavalera`, todas as transformações são combinadas em uma **única matriz** `M`, aplicada a cada vértice antes da projeção cavaleira:

```javascript
M = Mob · Translação · Rotação · Escala
```

A ordem importa: a escala é aplicada primeiro, depois a rotação, depois a translação e, por fim, a projeção `Mob`. Cada vértice (já centralizado em relação à origem do objeto) é multiplicado por `M` pelos dois `for` aninhados existentes.

**4. Controle pelo teclado**

Foi adicionado o objeto `keys` e os listeners `keydown` / `keyup`, que registram quais teclas estão pressionadas. A cada iteração do loop (`update`, a cada 100 ms), as funções `atualizaEscala`, `atualizaRotacao` e `atualizaTranslacao` leem o `keys` e incrementam/decrementam os valores correspondentes do objeto:

| Operação | Eixo X | Eixo Y | Eixo Z | Passo |
|----------|--------|--------|--------|-------|
| Escala   | `A` / `Z` | `S` / `X` | `D` / `C` |
| Rotação  | `F` / `V` | `G` / `B` | `H` / `N` | 
| Translação | `J` / `M` | `K` / `,` | `L` / `.` | 

Como o objeto é mutado a cada frame e a matriz `M` é recalculada em `projCavalera`, as transformações são vistas **animadas** enquanto a tecla é mantida pressionada.

**5. Mensagem de ajuda (`F1`)**

A ajuda é um **popup em HTML/CSS** — um `<div id="ajuda">` definido no `index.html` (painel branco com faixa de título, sobre um fundo escurecido) e estilizado no `styles.css`. A tecla `F1` apenas alterna a classe `oculto` desse `<div>` (`divAjuda.classList.toggle("oculto")`), mostrando ou escondendo o popup. Como é um elemento HTML, ele não é redesenhado pelo loop de renderização — ao contrário do canvas, fica fixo na tela até ser fechado.

---

### Fontes — Parte 2

1. **Luciana de Oliveira Berretta, Hugo A. D. do Nascimento — Transformações Geométricas** - Base teórica para as matrizes de escala, rotação e translação
2. **LLM (Claude — Anthropic)** — Ajuda para entendimento das ordens de matrizes de transformações e funcionamento das mesmas e criação de popup de ajuda  

---

## Como Executar

1. Clone o repositório
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Clique no botão de arquivo e selecione um `.txt` no formato descrito acima

```bash
git clone https://github.com/MDyszy/computacaografica
cd computacaografica/atividade4-computacaografica
# Abra o index.html no navegador
```

---

## Nota sobre este README

Este arquivo README foi **gerado com auxílio de Inteligência Artificial**, especificamente pelo modelo **Claude Sonnet 4.6**.
