# 🖌️ Pincel — Computação Gráfica

> Aplicação de desenho livre em canvas controlada pelo teclado, desenvolvida com HTML, CSS e JavaScript puro.

---

## 📌 Sobre o Projeto

Este repositório reúne as atividades práticas da disciplina de **Computação Gráfica**, ministrada pelo professor **Hugo Alexandre Dantas do Nascimento** no período **2026/01**, na **Universidade Federal de Goiás — UFG**.

---

## 📋 Parcial 1

### Enunciado

Desenvolver um programa em HTML e JavaScript que apresente uma tela branca e permita ao usuário mover um quadrado preto de 8×8 pixels pelo teclado, deixando um rastro. Os controles exigidos eram:

| Tecla | Alternativa | Ação |
|---|---|---|
| `W` | `8` | Mover para cima |
| `X` | `2` | Mover para baixo |
| `A` | `4` | Mover para esquerda |
| `D` | `6` | Mover para direita |
| `S` | `5` | Limpar o desenho |
| `ESC` | — | Encerrar a aplicação |

---

### 🛠️ Decisões Técnicas

- **API Canvas** foi escolhida como base para a renderização
- O canvas foi dimensionado para ocupar a tela inteira do navegador via `window.innerWidth` e `window.innerHeight`
- Dois eventos de teclado (`keydown` e `keyup`) foram adicionados para controle preciso do estado das teclas por meio de um objeto `keys`
- A posição do pincel é controlada pelas variáveis `x` e `y`, iniciando no centro da tela, com uma variável `speed` definindo o deslocamento por frame
- A função `brush()` desenha um retângulo de 8×8 pixels com `fillRect`, colorido via `fillStyle`
- A função `eraseEverything()` limpa o canvas inteiro com `clearRect`
- A função `borderLimit()` impede que o pincel ultrapasse os limites do canvas
- A função `update()` centraliza o loop da aplicação e utiliza `requestAnimationFrame()` para animação contínua

---

### 📚 Fontes — Parcial 1

Fontes utilizadas para entendimento da API Canvas, novas funções e sintaxe de JavaScript:

1. [YouTube — Introdução ao Canvas](https://www.youtube.com/watch?v=y84tBZo8GFo&t)
2. [YouTube — Canvas API](https://www.youtube.com/watch?v=LQpxDIBPDMA)
3. [YouTube — Animações com Canvas](https://www.youtube.com/watch?v=LyWSsZktVOg)
4. [Udemy — Formação Front-End: HTML, CSS, JavaScript, React](https://www.udemy.com/course/formacao-front-end-html-css-javascript-react-e/) *(para entendimento de eventos)*
5. [YouTube — Eventos de teclado em JS](https://www.youtube.com/watch?v=pUR5O9UO4Vc)
6. [YouTube — requestAnimationFrame](https://www.youtube.com/watch?v=4vCBmu3z5FY)
7. [MDN Web Docs](https://developer.mozilla.org/en-US/)
8. **LLM (Claude — Anthropic)** — utilizado para entendimento de: Arrow Functions, Eventos e funcionamento de `window.close()`

## 🚀 Como Executar

1. Clone o repositório
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Nenhuma dependência externa ou instalação é necessária

```bash
git clone https://github.com/MDyszy/computacaografica
cd computacaografica/atividade1-computacaografica
# Abra o index.html no navegador
```

---

## 🤖 Nota sobre este README

Este arquivo README foi **gerado com auxílio de Inteligência Artificial**, especificamente pelo modelo **Claude Sonnet 4.6**.
