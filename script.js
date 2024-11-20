document.addEventListener('DOMContentLoaded', () => {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('gameArea');
    const enemiesContainer = document.getElementById('enemies');
    const bulletsContainer = document.getElementById('bullets');
    const asteroidsContainer = document.createElement('div');
    asteroidsContainer.id = 'asteroids';
    gameArea.appendChild(asteroidsContainer);
    const scoreElement = document.getElementById('score');

    const gameAreaWidth = gameArea.clientWidth;
    const gameAreaHeight = gameArea.clientHeight; 
    
    let positionX = gameAreaWidth/2;
    let positionY = gameAreaHeight-100;
    let movementInterval = null;
    let enemyInterval = null;
    let asteroidInterval = null;
    let score = 0;
    const step = 10;
    let asteroidCount = 0;
    let gameRunning = true;
    let gamePaused = false;
    let lastMove = Date.now(); // Para rastrear o tempo do último movimento
    
    // Variáveis para rastrear o estado das teclas de direção
    let keyState = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        p: false // Tecla P para pausar/despausar
    };
    
    // Função para mover o jogador
    function movePlayer() {
        if (!gameRunning || gamePaused) return;
        
        let newX = positionX;
        let newY = positionY;
    
        if (keyState.ArrowUp) {
            newY -= step;
        }
        if (keyState.ArrowDown) {
            newY += step;
        }
        if (keyState.ArrowLeft) {
            newX -= step;
        }
        if (keyState.ArrowRight) {
            newX += step;
        }
    
        // Verificar limites do jogo
        if (newX >= 0 && newX <= gameArea.clientWidth - player.clientWidth) {
            positionX = newX;
        }
        if (newY >= 0 && newY <= gameArea.clientHeight - player.clientHeight) {
            positionY = newY;
        }
    
        player.style.top = positionY + 'px';
        player.style.left = positionX + 'px';
    }
    
    // Função para criar inimigos
    function createEnemy() {
        if (!gameRunning || gamePaused) return;
        
        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
        enemy.style.top = Math.floor(Math.random() * (gameArea.clientHeight - enemy.clientHeight)) + 'px';
        
        const direction = Math.random() < 0.5 ? 'left' : 'right';
        if (direction === 'left') {
            enemy.style.left = gameArea.clientWidth + 'px';
            enemy.style.transform = 'scaleX(-1)';
        } else {
            enemy.style.left = -enemy.clientWidth + 'px';
        }
        
        enemiesContainer.appendChild(enemy);
        
        // Animação de movimento do inimigo
        const speed = Math.random() * 2 + 1; // Velocidade aleatória
        let enemyMovement = setInterval(() => {
            if (!gameRunning || gamePaused) {
                clearInterval(enemyMovement);
                return;
            }
            
            if (direction === 'left') {
                enemy.style.left = (parseInt(enemy.style.left) - speed) + 'px';
            } else {
                enemy.style.left = (parseInt(enemy.style.left) + speed) + 'px';
            }
            
            // Verifica colisão do inimigo com o jogador
            if (checkCollision(enemy, player)) {
                gameOver();
            }
            
            // Verifica se o inimigo deve disparar um míssil
            if (Math.random() < 0.02) { // Chance de 2% a cada iteração de criar um míssil
                enemyShoot(enemy);
            }
            
            // Verifica se o inimigo saiu da tela
            if (parseInt(enemy.style.left) + enemy.clientWidth < 0 || parseInt(enemy.style.left) > gameArea.clientWidth) {
                clearInterval(enemyMovement);
                enemiesContainer.removeChild(enemy);
            }
        }, 20);
    }
    
    // Função para o inimigo disparar um míssil
    function enemyShoot(enemy) {
        if (!gameRunning || gamePaused) return;
        
        const bullet = document.createElement('div');
        bullet.classList.add('enemyBullet');
        bullet.style.top = (parseInt(enemy.style.top) + enemy.clientHeight) + 'px';
        bullet.style.left = (parseInt(enemy.style.left) + (enemy.clientWidth / 2) - 5) + 'px';
        gameArea.appendChild(bullet);
        
        // Animação de movimento do míssil do inimigo
        let bulletMovement = setInterval(() => {
            if (!gameRunning || gamePaused) {
                clearInterval(bulletMovement);
                return;
            }
            
            bullet.style.top = (parseInt(bullet.style.top) + 5) + 'px';
            
            // Verifica colisão do míssil do inimigo com o jogador
            if (checkCollision(bullet, player)) {
                gameOver();
            }
            
            // Verifica se o míssil do inimigo saiu da tela
            if (parseInt(bullet.style.top) > gameArea.clientHeight) {
                clearInterval(bulletMovement);
                gameArea.removeChild(bullet);
            }
        }, 20);
    }
    
    // Função para criar asteroides
    function createAsteroid() {
        if (asteroidCount >= 7) return; // Limite máximo de asteroides
        
        const asteroid = document.createElement('div');
        asteroid.classList.add('asteroid');
        
        // Posicionamento aleatório
        const side = Math.random();
        if (side < 0.33) {
            // Vem da esquerda
            asteroid.style.left = -50 + 'px';
            asteroid.style.top = Math.floor(Math.random() * (gameArea.clientHeight - 50)) + 'px';
        } else if (side < 0.66) {
            // Vem de cima
            asteroid.style.top = -50 + 'px';
            asteroid.style.left = Math.floor(Math.random() * (gameArea.clientWidth - 50)) + 'px';
        } else {
            // Vem da direita
            asteroid.style.left = gameArea.clientWidth + 'px';
            asteroid.style.top = Math.floor(Math.random() * (gameArea.clientHeight - 50)) + 'px';
        }
        
        asteroidsContainer.appendChild(asteroid);
        asteroidCount++;
        
        // Animação de movimento do asteroide
        const speed = Math.random() * 2 + 1; // Velocidade aleatória
        let asteroidMovement = setInterval(() => {
            if (!gameRunning || gamePaused) {
                clearInterval(asteroidMovement);
                return;
            }
            
            if (side < 0.33) {
                asteroid.style.left = (parseInt(asteroid.style.left) + speed) + 'px';
            } else if (side < 0.66) {
                asteroid.style.top = (parseInt(asteroid.style.top) + speed) + 'px';
            } else {
                asteroid.style.left = (parseInt(asteroid.style.left) - speed) + 'px';
            }
            
            // Verifica colisão do asteroide com o jogador
            if (checkCollision(asteroid, player)) {
                gameOver();
            }
            
            // Verifica se o asteroide saiu da tela
            if (parseInt(asteroid.style.left) > gameArea.clientWidth || parseInt(asteroid.style.top) > gameArea.clientHeight || parseInt(asteroid.style.left) < -50 || parseInt(asteroid.style.top) < -50) {
                clearInterval(asteroidMovement);
                asteroidsContainer.removeChild(asteroid);
                asteroidCount--;
            }
        }, 20);
        
        // Novo intervalo para criar asteroides
        asteroidInterval = setTimeout(createAsteroid, Math.random() * 2000 + 1000); // Intervalo aleatório entre 1 e 3 segundos
    }
    
    // Função para criar uma bala do jogador
    function shootBullet() {
        if (!gameRunning || gamePaused) return;
        
        const bullet = document.createElement('div');
        bullet.classList.add('bullet');
        bullet.style.top = (parseInt(player.style.top) - 20) + 'px';
        bullet.style.left = (parseInt(player.style.left) + (player.clientWidth / 2) - 5) + 'px';
        bulletsContainer.appendChild(bullet);
        
        // Animação de movimento da bala
        let bulletMovement = setInterval(() => {
            if (!gameRunning || gamePaused) {
                clearInterval(bulletMovement);
                return;
            }
            
            bullet.style.top = (parseInt(bullet.style.top) - 5) + 'px';
            
            // Verifica se a bala atingiu um inimigo
            let enemies = document.querySelectorAll('.enemy');
            enemies.forEach(enemy => {
                if (checkCollision(bullet, enemy)) {
                    enemiesContainer.removeChild(enemy);
                    score += 50; // Aumenta o score
                    scoreElement.innerText = 'Score: ' + score;
                    clearInterval(bulletMovement);
                    bulletsContainer.removeChild(bullet);
                }
            });
            
            // Verifica se a bala atingiu um asteroide
            let asteroids = document.querySelectorAll('.asteroid');
            asteroids.forEach(asteroid => {
                if (checkCollision(bullet, asteroid)) {
                    asteroidsContainer.removeChild(asteroid);
                    score += 100; // Aumenta o score
                    scoreElement.innerText = 'Score: ' + score;
                    clearInterval(bulletMovement);
                    bulletsContainer.removeChild(bullet);
                }
            });
            
            // Verifica se a bala saiu da tela
            if (parseInt(bullet.style.top) < -20) {
                clearInterval(bulletMovement);
                bulletsContainer.removeChild(bullet);
            }
        }, 20);
    }
    
    // Função para verificar colisão entre dois elementos
    function checkCollision(el1, el2) {
        const rect1 = el1.getBoundingClientRect();
        const rect2 = el2.getBoundingClientRect();
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }
    
    // Função para pausar/despausar o jogo
    function togglePause() {
        gamePaused = !gamePaused;
        if (gamePaused) {
            alert('Game Paused. Press P to resume.');
        } else {
            alert('Game Resumed.');
        }
    }
    
    // Função para terminar o jogo
    function gameOver() {
        gameRunning = false;
        clearInterval(movementInterval);
        clearInterval(enemyInterval);
        clearInterval(asteroidInterval);
        alert('Game Over! Your score: ' + score);
    }
    
    // Função para atualizar o estado das teclas
    function updateKeyState(key, isPressed) {
        if (key in keyState) {
            keyState[key] = isPressed;
        }
    }
    
    // Inicialização do jogo
    function init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                shootBullet();
            }
            if (e.key.toLowerCase() === 'p') {
                togglePause();
            }
        });
        document.addEventListener('keydown', (e) => updateKeyState(e.key, true));
        document.addEventListener('keyup', (e) => updateKeyState(e.key, false));
        
        movementInterval = setInterval(movePlayer, 20);
        enemyInterval = setInterval(createEnemy, 3000);
        asteroidInterval = setTimeout(createAsteroid, Math.random() * 2000 + 1000);
    }
    
    init();
});
