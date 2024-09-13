const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
canvas.width = box * 20;
canvas.height = box * 30;

let snake = [{ x: 9 * box, y: 10 * box }];
let direction = null;
let food = generateFood();
let score = 0;
let game;
let gameOverFlag = false;
const gameSpeed = 100;
let nickname = '';

function generateFood() {
    return {
        x: Math.floor(Math.random() * 20) * box,
        y: Math.floor(Math.random() * 30) * box
    };
}

function setDirection(newDirection) {
    if (newDirection === "UP" && direction !== "DOWN") direction = "UP";
    if (newDirection === "DOWN" && direction !== "UP") direction = "DOWN";
    if (newDirection === "LEFT" && direction !== "RIGHT") direction = "LEFT";
    if (newDirection === "RIGHT" && direction !== "LEFT") direction = "RIGHT";
}

function changeDirection(event) {
    if (event.key === "ArrowUp") setDirection("UP");
    if (event.key === "ArrowDown") setDirection("DOWN");
    if (event.key === "ArrowLeft") setDirection("LEFT");
    if (event.key === "ArrowRight") setDirection("RIGHT");
}

function handleClick(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const dx = x - centerX;
    const dy = y - centerY;

    if (Math.abs(dx) > Math.abs(dy)) {
        setDirection(dx > 0 ? "RIGHT" : "LEFT");
    } else {
        setDirection(dy > 0 ? "DOWN" : "UP");
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Еда
    const img = new Image();
    img.src = "https://cryptologos.cc/logos/solana-sol-logo.png";
    ctx.drawImage(img, food.x, food.y, box, box);

    // Змейка
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "#711dd9" : "#9945ff";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    // Передвижение
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === "UP") snakeY -= box;
    if (direction === "DOWN") snakeY += box;
    if (direction === "LEFT") snakeX -= box;
    if (direction === "RIGHT") snakeX += box;

    // Съедание еды
    if (snakeX === food.x && snakeY === food.y) {
        score++;
        document.getElementById("score").innerText = score;
        food = generateFood();
    } else {
        snake.pop();
    }

    let newHead = { x: snakeX, y: snakeY };

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
        gameOver();
    }

    snake.unshift(newHead);
}

function collision(head, body) {
    for (let i = 0; i < body.length; i++) {
        if (head.x === body[i].x && head.y === body[i].y) return true;
    }
    return false;
}

function gameOver() {
    if (!gameOverFlag) {
        gameOverFlag = true;
        document.getElementById('final-score').innerText = score;
        document.getElementById('popup').style.display = 'block';
        clearInterval(game);
        saveScore();
    }
}

async function saveScore() {
    if (nickname) {
        try {
            const response = await fetch('http://localhost:3000/api/scores', { // Убедитесь, что этот URL соответствует вашему серверу
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nickname, score })
            });
            if (!response.ok) throw new Error('Failed to save score');
        } catch (error) {
            console.error('Error saving score:', error);
        }
    }
}

async function showLeaderboard() {
    try {
        const response = await fetch('http://localhost:3000/api/scores');
        if (!response.ok) throw new Error('Failed to fetch leaderboard');
        const leaderboard = await response.json();
        let leaderboardText = '';
        leaderboard.forEach(entry => {
            leaderboardText += `<li>${entry.nickname}: ${entry.score}</li>`;
        });
        document.getElementById('leaderboard-list').innerHTML = leaderboardText;
        document.getElementById('leaderboard-popup').style.display = 'block';
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
    }
}


function startGame() {
    nickname = document.getElementById("nickname").value.trim();
    if (nickname) {
        snake = [{ x: 9 * box, y: 10 * box }];
        direction = null;
        food = generateFood();
        score = 0;
        document.getElementById("score").innerText = score;
        document.getElementById('popup').style.display = 'none';
        gameOverFlag = false;
        game = setInterval(drawGame, gameSpeed);
    } else {
        alert("Please enter your nickname to start the game.");
    }
}

function closePopup() {
    // Закрываем popup
    document.getElementById('popup').style.display = 'none';
    document.getElementById('leaderboard-popup').style.display = 'none';
    
    // Восстанавливаем интерфейс
    if (!gameOverFlag) {  // Если игра не окончена, то показываем элементы
        document.getElementById("nickname").style.display = "block";
        document.getElementById("start-game").style.display = "block";
        document.getElementById("leaderboard-btn").style.display = "block";
    } 

    // Всегда показываем кнопки управления после закрытия popup
    document.querySelector(".controls").style.display = "flex";
}


document.getElementById("start-game").addEventListener("click", startGame);
document.getElementById("leaderboard-btn").addEventListener("click", showLeaderboard);
document.getElementById("close-popup").addEventListener("click", closePopup);
document.getElementById("close-leaderboard-popup").addEventListener("click", closePopup);

document.addEventListener("keydown", changeDirection);
canvas.addEventListener("click", handleClick);
document.addEventListener('keydown', function(event) {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();  // Блокируем скроллинг страницы
    }
});

// Mobile controls handling
const controls = document.querySelector('.controls');
const controlButtons = document.querySelectorAll('.control-btn');

controlButtons.forEach(button => {
    button.addEventListener('click', () => {
        setDirection(button.getAttribute('data-direction'));
    });
});
