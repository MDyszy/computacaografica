# 🎨 Computação Gráfica — Atividade Prática 3

> Implementação dos algoritmos **DDA** (para retas) e **Scan Line Fill** (para preenchimento de polígonos) utilizando HTML, CSS e JavaScript puro.

---

## 📌 Descrição

Este projeto é uma atividade prática da disciplina de **Computação Gráfica**. A aplicação renderiza polígonos aleatórios diretamente em um canvas com fundo preto, utilizando algoritmos clássicos de rasterização e preenchimento.

A cada pressionamento da tecla **Espaço**, o sistema sorteia aleatoriamente:
- 🎲 Uma **cor para a borda** e uma **cor para o preenchimento** (em formato hexadecimal)
- 📐 Um **número de vértices** entre 3 e 8
- 📍 **Posições aleatórias** na tela para cada vértice

A renderização é feita **pixel a pixel** por meio de uma função `putPixel`, que preenche um retângulo de 1×1 pixel no canvas. O contorno do polígono é traçado com o algoritmo DDA e o interior é preenchido com o algoritmo de Análise Geométrica (Scan Line Fill).

---

## ⚙️ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Cores aleatórias | Gera cores hexadecimais aleatórias para borda e preenchimento |
| Vértices aleatórios | Sorteia entre 3 e 8 vértices com posições aleatórias no canvas |
| Algoritmo DDA | Utilizado para rasterizar as **arestas** do polígono pixel a pixel |
| Algoritmo Scan Line Fill | Utilizado para **preencher o interior** do polígono pixel a pixel |
| Ordenação Bubble Sort | Utilizado para ordenar os pontos de interseção em ordem crescente |
| Interação via teclado | Pressionar **Espaço** gera um novo polígono preenchido e **ESC** encerra a aplicação|

---

## 🧮 Algoritmos Implementados

### 📏 DDA — Digital Differential Analyzer (Arestas)

O algoritmo DDA calcula os pontos intermediários de uma reta a partir de dois pontos `(x₀, y₀)` e `(x₁, y₁)`. Ele determina o número de passos necessários com base na maior variação entre `Δx` e `Δy`, incrementando as coordenadas proporcionalmente a cada passo.

```
passos = max(|Δx|, |Δy|)
incremento_x = Δx / passos
incremento_y = Δy / passos
```

### 🔷 Scan Line Fill — Análise Geométrica (Preenchimento)

O algoritmo de Análise Geométrica preenche o interior de um polígono utilizando linhas de varredura horizontais. Ele funciona em 3 passos:

**1° Passo — Montar a tabela de lados:** para cada aresta do polígono, registra-se `Ymin`, `Ymax`, `X para Ymin` e `1/m` (inverso do coeficiente angular). Lados horizontais são desconsiderados.

```
Ymin  = menor Y da aresta
Ymax  = maior Y da aresta
Xymin = X do vértice com menor Y
1/m   = Δx / Δy
```

**2° Passo — Interseção com a linha de varredura:** para cada linha de varredura, identificam-se quais arestas são interceptadas e calcula-se o ponto X de interseção.

```
Se Yvarredura < Ymin → descarta (a linha não alcança a aresta)
Se Yvarredura >= Ymax → descarta (a linha já passou da aresta)
X = (1/m) × (Yvarredura − Ymin) + Xymin
```

**3° Passo — Ordenação e pintura:** os pontos de interseção são inseridos em uma lista, ordenados em ordem crescente com Bubble Sort, e os pixels são preenchidos tomando os pontos de dois em dois.

```
Ordenar interseções em ordem crescente
Para cada par [Xinício, Xfim]:
    Pintar todos os pixels de Xinício até Xfim
```

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** — estrutura e elemento `<canvas>`
- **CSS3** — estilização da interface
- **JavaScript** — lógica dos algoritmos e manipulação do canvas

---

## 🚀 Como Executar

1. Clone ou baixe o repositório
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Nenhuma dependência externa ou instalação é necessária

```bash
# Exemplo clonando via git
git clone <url-do-repositório>
cd <pasta-do-projeto>
# Abra o index.html no navegador
```

> 💡 Pressione **Espaço** para gerar um novo polígono preenchido.
> 💡 Pressione **ESC** para encerrar a aplicação.

---

## 📚 Referências

1. **Projeto base** — Repositório de referência utilizado como ponto de partida para a estrutura do projeto:
   [MDyszy/computacaografica — atividade2](https://github.com/MDyszy/computacaografica/tree/main/atividade2-computacaografica)

2. **Slide 04 — Preenchimento de Polígonos** — Slides dos professores Luciana de Oliveira Berretta e Hugo A. D. do Nascimento, ambos do Instituto de Informática da UFG.

3. **Método Math.floor** — Documentação MDN utilizada como referência para arredondamento de valores:
   [MDN — Math.floor](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Math/floor)

4. **Método Math.ceil** — Documentação MDN utilizada como referência para arredondamento de valores:
   [MDN — Math.ceil](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil)

5. **Método Math.random** — Documentação MDN utilizada como referência para geração de valores aleatórios:
   [MDN — Math.random](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Math/random)

6. **Claude Opus 4.6** - Para entendimento do 2° passo da função Scan Line Fill (Adaptação didática de 3 passos pelo Slide da disciplina)
---

## 🤖 Nota sobre este README

Este arquivo README foi **gerado com o auxílio de Inteligência Artificial**, especificamente pelo modelo **Claude Opus 4.6**.
