# Parcial 5 — Computação Gráfica

> Visualizador de objetos 3D em wireframe com suporte a múltiplas projeções geométricas, desenvolvido com HTML, CSS e JavaScript puro.

---

## Sobre o Projeto

Este repositório contém a atividade da **Parcial 5** da disciplina de **Computação Gráfica**, ministrada pelo professor **Hugo Alexandre Dantas do Nascimento** no período **2026/1**, na **Universidade Federal de Goiás — UFG**.

O projeto é uma evolução das entregas anteriores, que já contavam com leitura de arquivo `.txt`, renderização em wireframe com DDA, transformações geométricas (escala, rotação, translação) via teclado e a projeção Cavaleira. Esta entrega adiciona as demais projeções geométricas e a troca entre elas via teclado.

---

## Enunciado

Implementar as seguintes projeções geométricas no sistema:

- Paralela Oblíqua Cavaleira *(já existia)*
- Paralela Oblíqua Cabinet
- Paralela Ortográfica Isométrica
- Perspectiva com um ponto de fuga em Z
- Perspectiva com dois pontos de fuga, em X e em Z

Associar a tecla **P** à troca circular entre as projeções, definindo a **Cavaleira como padrão**. O programa deve indicar a projeção em uso no **canto superior direito da tela**.

---

## O que foi implementado

### Novas projeções

| Projeção | Descrição |
|---|---|
| Paralela Oblíqua Cabinet | Paralela oblíqua com `l = 0.5` e `α = 63.4°` |
| Paralela Ortográfica Isométrica | Caso especial β = 90° (`l = 0`), descarta Z |
| Perspectiva com um ponto de fuga em Z | Fuga no eixo Z, distância `d = 3` |
| Perspectiva com dois pontos de fuga, em X e em Z | Fuga nos eixos X e Z, `dx = dz = 3` |

---

### Matrizes (convenção coluna: `v' = M · v`)

As matrizes do código são a transposta das dos slides (que usam convenção linha `v' = v · M`). Os sinais negativos na coluna Z das projeções oblíquas compensam o eixo Z apontando para fora da tela.

**Cabinet** (`l = 0.5`, `α = 63.4°`):
```
Mob = [ 1,  0,  -0.5·cos(63.4°),  0 ]
      [ 0,  1,  -0.5·sin(63.4°),  0 ]
      [ 0,  0,   0,                0 ]
      [ 0,  0,   0,                1 ]
```

**Ortográfica Isométrica** — caso β = 90° da fórmula oblíqua geral (`l = 1/tan β`), resultando em `l = 0`:
```
Mob = [ 1,  0,  0,  0 ]
      [ 0,  1,  0,  0 ]
      [ 0,  0,  0,  0 ]
      [ 0,  0,  0,  1 ]
```

**Perspectiva 1 ponto** (fuga em Z, distância `d = 3`):
```
Mp = [ 1,  0,   0,   0 ]
     [ 0,  1,   0,   0 ]
     [ 0,  0,   0,   0 ]
     [ 0,  0,  1/d,  1 ]
```

**Perspectiva 2 pontos** (fuga em X e Z, `dx = dz = 3`):
```
Mp = [    1,  0,    0,  0 ]
     [    0,  1,    0,  0 ]
     [    0,  0,    1,  0 ]
     [ 1/dx,  0, 1/dz,  1 ]
```

> Nas perspectivas, as coordenadas finais são obtidas com divisão homogênea: `x' = res[0] / res[3]`, `y' = res[1] / res[3]`. Nas projeções paralelas `res[3]` sempre vale `1`, então a divisão é aplicada de forma uniforme em todos os casos.

---

### Troca de projeção (tecla P)

O array `projecoes` armazena os nomes das cinco projeções. A cada pressionamento de **P**, `indiceProj` é incrementado com retorno circular (`% projecoes.length`), e o `if/else` no loop de renderização chama a função correspondente. A projeção padrão ao iniciar é a Cavaleira (`indiceProj = 0`).

### Exibição do nome

O nome da projeção ativa é exibido por um `<div id="nome-projecao">` posicionado com `position: fixed; top: 16px; right: 16px` no CSS, atualizado a cada frame via `divNomeProjecao.textContent`.

---

## Como Executar

1. Clone o repositório
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Clique no botão de arquivo e selecione um `.txt` no formato abaixo

```bash
git clone https://github.com/MDyszy/computacaografica
cd computacaografica/atividade5-computacaografica
# Abra o index.html no navegador
```

### Formato do arquivo `.txt`

```
n          ← número de vértices
m          ← número de arestas
x y z      ← coordenadas de cada vértice (n linhas)
i j        ← índices dos vértices de cada aresta (m linhas)
Tx Ty Tz   ← translação inicial
Rx Ry Rz   ← rotação inicial (em graus)
Sx Sy Sz   ← escala inicial
```

---

## Fontes

1. **Julio Arakaki — Projeções Geométricas (PUC-SP)** — base teórica para as projeções paralelas oblíquas e ortográfica
2. **Hugo A. D. do Nascimento — Projeções (UFG)** — base teórica para as matrizes de perspectiva
3. **LLM (Claude — Anthropic)** — auxílio na nas matrizes de perspectiva de ponto e funcionamento das mesmas

---

## Nota sobre este README

Este arquivo foi **gerado com auxílio de Inteligência Artificial**, especificamente pelo modelo **Claude Sonnet 4.6**.
