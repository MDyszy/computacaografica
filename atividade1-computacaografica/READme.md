# Projeto - Pincel 

**O projeto foi realizado para a disciplina de Computação Gráfica, ministrada por Hugo Alexandre Dantas do Nascimento no período 2026/01, na Universidade Federal de Goiás - UFG.**
**O projeto será realizado de forma contínua durante o período da disciplina e por isso terá este arquivo alterado a cada parcial.**
**Esse arquivo terá por objetivo a definição de parciais do que foi feito, fontes utilizadas e documentação do código em si.**

## Parcial número 1
**Desenvolva um programa em HTML e Javascript que apresente uma tela branca e que permita que o usuário mova um quadrado preto de 8x8 pixels por meio de teclas do teclado, deixando um rastro.**
**As teclas a serem usadas são as seguintes:**
**8 e w/W - move para cima**
**2 e x/X - move para baixo**
**4 e a/A - move para esquerda**
**6 e d/D - move para direita**
**5 e s/S - limpa o desenho (pinta de branco a tela)**
**ESC - encerra a aplicação**

**- Para a primeira parcial, foi decidida a utilização da API Canvas**
**- Como elemento canvas, foi definido a tela visível do navegador (window.innerWidth e window.innerHeight)**
**- Foram adicionados 2 eventos para a utilização do teclado.**
**- Foram utilizadas definição simples de posição com elementos x e y. Além disso, foi definida uma variável "speed" que alterará a posição do pincel por meio das teclas "w/8", para cima; "a/4", para a esquerda; "d/6", para a direita; "x/2", para baixo.**
**- Para apagar o desenho, foi definido a tecla "s/5". As teclas chamarão a função "eraseEverything que apagará o desenho da parte superior esquerda até os limites do elemento canva.**
**- Para o pincel, foi desenhado um retângulo de 8px por 8px com fillRect e para a definição de cor fillStyle (function brush).**
**- Foi definida uma função update que realizará o funcionamento da aplicação e possui requestAnimationFrame() para a animação da aplicação.**

**As fontes utilizadas na primeira parcial para entendimento da API Canvas, Conhecimento de novas funções e sintaxe de JavaScript**
**1 - https://www.youtube.com/watch?v=y84tBZo8GFo&t**
**2 - https://www.youtube.com/watch?v=LQpxDIBPDMA**  
**3 - https://www.youtube.com/watch?v=LyWSsZktVOg**
**4 - https://www.udemy.com/course/formacao-front-end-html-css-javascript-react-e/ (Para entendimento de eventos)**
**5 - https://www.youtube.com/watch?v=pUR5O9UO4Vc**
**6 - https://www.youtube.com/watch?v=4vCBmu3z5FY**
**7 - https://developer.mozilla.org/en-US/**
**8 - Utilização de LLM (Claude) para o entendimento de: Arrow Functions, Eventos e funcionamento window.close().**

## Parcial número 2 