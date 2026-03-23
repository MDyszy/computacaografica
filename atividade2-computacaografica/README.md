# 🎨 Computação Gráfica — Atividade Prática 2

> Implementação dos algoritmos **DDA** (para retas) e **Bresenham** (para círculos) utilizando HTML, CSS e JavaScript puro.

---

## 📌 Descrição

Este projeto é uma atividade prática da disciplina de **Computação Gráfica**. A aplicação renderiza primitivas geométricas — retas e círculos — diretamente em um canvas com fundo preto, utilizando algoritmos clássicos de rasterização.

A cada ciclo de atualização (100ms), o sistema sorteia aleatoriamente:
- 🎲 Uma **cor** (em formato hexadecimal)
- 📍 Uma **posição** na tela
- 🔵 O **tipo de primitiva**: reta ou círculo
- ⭕ Um **raio** de até 200 pixels (caso a primitiva sorteada seja uma circunferência)

A renderização é feita **pixel a pixel** por meio de uma função `putPixel`, que preenche um retângulo de 1×1 pixel no canvas, respeitando a lógica dos algoritmos clássicos de rasterização.

---

## ⚙️ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Cores aleatórias | Gera uma cor hexadecimal aleatória a cada ciclo |
| Posição aleatória | Sorteia coordenadas aleatórias dentro do canvas |
| Escolha de primitiva | Decide aleatoriamente entre desenhar uma reta ou um círculo |
| Raio aleatório | Sorteia um raio de até 200 pixels quando um círculo é selecionado (Para melhor enquadramento do círculo) |
| Algoritmo DDA | Utilizado para rasterizar **retas** pixel a pixel |
| Algoritmo de Bresenham | Utilizado para rasterizar **círculos** pixel a pixel |
| Loop de animação | Novas primitivas são desenhadas automaticamente a cada **100ms** |
| Encerramento via teclado | Pressionar **ESC** exibe um alerta e encerra a aplicação |

---

## 🧮 Algoritmos Implementados

### 📏 DDA — Digital Differential Analyzer (Retas)

O algoritmo DDA calcula os pontos intermediários de uma reta a partir de dois pontos `(x₀, y₀)` e `(x₁, y₁)`. Ele determina o número de passos necessários com base na maior variação entre `Δx` e `Δy`, incrementando as coordenadas proporcionalmente a cada passo.

```
passos = max(|Δx|, |Δy|)
incremento_x = Δx / passos
incremento_y = Δy / passos
```

### ⭕ Bresenham — Algoritmo para Círculos

O algoritmo de Bresenham para círculos utiliza simetria de 8 pontos para rasterizar um círculo inteiro a partir de apenas 1/8 do arco, calculando quais pixels ativar por meio de um parâmetro de decisão inteiro, evitando operações com ponto flutuante.

```
x = 0; y = r - 1
d = 1 - r
enquanto y > x:
    se d < 0: d += 2x + 3
    senão:    d += 2(x - y) + 5; y--
    x++
    plotar os 8 pontos simétricos
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

> 💡 Pressione **ESC** para encerrar a aplicação.

---

## 📚 Referências

1. **Projeto base** — Repositório de referência utilizado como ponto de partida para a estrutura do projeto:
   [MDyszy/computacaografica](https://github.com/MDyszy/computacaografica)

2. **Geração de cores hexadecimais aleatórias com JavaScript** — Solução consultada no Stack Overflow em Português para a implementação da função de cor aleatória:
   [stackoverflow.com — Como gerar cores hexadecimais aleatórias com JavaScript](https://pt.stackoverflow.com/questions/493278/como-gerar-cores-hexadecimais-aleat%C3%B3rias-com-javascript)

3. **Algoritmo de Bresenham para círculos** — Vídeo explicativo utilizado como referência para a implementação do algoritmo de rasterização de círculos:
   [YouTube — Bresenham Circle Algorithm](https://www.youtube.com/watch?v=sg_pS86P3Xw)
   
---

## 🤖 Nota sobre este README

Este arquivo README foi **inteiramente gerado por Inteligência Artificial**, especificamente pelo modelo **Claude Sonnet 4.6**.
