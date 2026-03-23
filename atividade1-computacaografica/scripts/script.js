canvas = document.querySelector("canvas");
ctx = canvas.getContext("2d"); 

// Dimensão do Canvas para tela inteira
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Centralização de posição inicial do meio do canvas
x = canvas.width / 2; 
y = canvas.height / 2; 

// Definição de velocidade e objeto para controle de teclas
speed = 1;
keys = {};

// Clique de teclas 
window.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Funções de funcionamento
function brush(){ // Pincel (posição, tamanho e cor)
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, y, 8, 8);
}

function eraseEverything(){ // Função para apagar o desenho
    ctx.clearRect(0,0,canvas.width,canvas.height);
}

function closeWindow(){ // Função para fechar a aplicação
    alert("Aplicação encerrada!")
    window.close();
}

function borderLimit(){ // Função para limitar o movimento do quadrado dentro da tela
    if(x < 0){
        x = 0;
    }

    if(x > canvas.width - 8){
        x = canvas.width - 8;
    }

    if (y < 0){
        y = 0;
    }

    if (y > canvas.height - 8){
        y = canvas.height - 8;
    }
}

function update(){ // Função de loop para atualizar a posição do quadrado e desenhar 
    if(keys["w"] || keys["8"]){
        y -= speed;
    } 

    if(keys["a"] || keys["4"]){
        x -= speed;
    }

    if(keys["x"] || keys["2"]){
        y += speed;
    } 

    if(keys["d"] || keys["6"]){
        x += speed;
    }

    if(keys["s"] || keys["5"]){
        eraseEverything();
    }   

    if(keys["escape"]){
        closeWindow();
    }

    borderLimit();
    brush();
    requestAnimationFrame(update);
}

update(); // Loop