# Atividade 6 — Computação Gráfica

Projeto em grupo desenvolvido para a disciplina de **Computação Gráfica**, ministrado por Hugo Alexandre Dantas do Nascimento na Universidade Federal de Goiás no semestre 2026/01. 

## Proposta

Aplicação web (HTML + Canvas + JavaScript) que carrega objetos 3D a partir de um arquivo `.dat` e os exibe com suporte a cinco tipos de projeção:

- Paralela Oblíqua Cavaleira
- Paralela Oblíqua Cabinet
- Paralela Ortográfica Isométrica
- Perspectiva com um ponto de fuga (eixo Z)
- Perspectiva com dois pontos de fuga (eixos X e Z)

Cada objeto pode ser selecionado individualmente (TAB / SHIFT+TAB) e manipulado de forma independente via teclado, aplicando escala, rotação e translação.

## Como executar

O programa usa `fetch` para carregar o arquivo `exemplos-arquivos/figure.dat`. Por restrição de segurança dos browsers, o `fetch` **não funciona quando o `index.html` é aberto diretamente pelo explorador de arquivos** (protocolo `file://`). É necessário servir os arquivos via HTTP. A forma mais simples é usar a extensão **Live Server** do VSCode: clique com o botão direito em `index.html` e selecione *Open with Live Server*.

## Como o programa funciona

### Carregamento do arquivo

Ao iniciar, o programa usa `fetch` para carregar o arquivo `exemplos-arquivos/figure.dat`. O texto retornado é passado para a função `lerArquivoFigura`, que lê linha a linha de forma sequencial: primeiro o nome da figura e a área do universo, depois a quantidade de objetos e, para cada um, todos os seus dados.

Para montar cada objeto, a função chama `criarObjeto3D` (que cria a estrutura vazia) e em seguida preenche seus campos usando:

- `vertices.push([x, y, z])` — para cada ponto lido
- `arestas.push([a-1, b-1])` — para cada par de índices (convertido de base 1 para base 0)
- `adicionarFace(objeto, indices, [r, g, b])` — para cada face, que internamente chama `criarFace` e `calcularZMedioFace`

Ao final, todos os objetos são armazenados em `listaObjetos[]`.

### Loop de renderização

A função `update` roda a cada frame via `requestAnimationFrame`. A cada frame ela:

1. Lê o teclado e aplica escala, rotação e translação **somente ao objeto selecionado** (`atualizaEscala`, `atualizaRotacao`, `atualizaTranslacao`)
2. Percorre **todos** os objetos da lista e chama a função de projeção ativa para cada um
3. O objeto selecionado é desenhado em vermelho; os demais, em preto

### Pipeline de transformações

Cada função de projeção (ex: `projCavalera`, `projPersp1`) monta uma única matriz 4×4 combinada:

```
M = Mob · T · R · S
```

onde `Mob` é a matriz da projeção ativa, `T` é a translação, `R` é a rotação (Rz · Ry · Rx) e `S` é a escala. Antes de multiplicar, os vértices têm o centro geométrico do objeto subtraído, garantindo que escala e rotação ocorram em torno do próprio objeto. O resultado é mapeado para coordenadas de canvas (X somado ao centro da tela, Y invertido) e as arestas são desenhadas pixel a pixel pelo algoritmo DDA.

## Correções realizadas

### Projeção isométrica — matriz incorreta

A matriz isométrica original era uma projeção ortográfica frontal simples (zerando Z), o que não corresponde à projeção isométrica verdadeira. A matriz foi substituída pela derivação correta, que combina uma projeção ortogonal com rotações de Ry(45°) e Rx(−35,264°).

Fonte: [Computação Gráfica — Projeções Paralelas, UFLA](https://bruno.dac.ufla.br/aulas/cg/monte-mor/45.htm)

### Perspectiva — objetos aparecendo como ponto

Com os valores originais de distância focal (`d = 3`) e as translações Z dos objetos no arquivo (`z = 100` para o cubo, `z = 20` para a pirâmide), o denominador da divisão homogênea (`w = z/d + 1`) ficava muito alto, comprimindo toda a geometria a um ponto quase invisível na tela.

A correção envolveu duas etapas:

1. **Aumentar a distância focal** de `d = 3` para `d = 200`, trazendo o plano de projeção para uma escala compatível com o tamanho dos objetos.
2. **Zerar a translação Z nas funções de perspectiva** — a translação em Z colocava o objeto inteiro a uma profundidade fixa, fazendo o `w` crescer uniformemente e anular o efeito de perspectiva. Com Z-translação zerada nas funções `projPersp1` e `projPersp2`, a variação de profundidade passa a vir exclusivamente da geometria do objeto (escala), tornando o efeito perspectivo visível e proporcional.
