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
let gameOverFlag = false; // Флаг для отслеживания состояния игры
const gameSpeed = 100; // Устанавливаем скорость игры

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

    // Определяем направление в зависимости от клика
    if (Math.abs(dx) > Math.abs(dy)) {
        setDirection(dx > 0 ? "RIGHT" : "LEFT");
    } else {
        setDirection(dy > 0 ? "DOWN" : "UP");
    }
}

function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Еда
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    // Змейка
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "lime" : "green";
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

    // Добавление новой головы
    let newHead = { x: snakeX, y: snakeY };

    // Проверка на столкновение
    if (
        snakeX < 0 || snakeY < 0 ||
        snakeX >= canvas.width || snakeY >= canvas.height ||
        collision(newHead, snake)
    ) {
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
        gameOverFlag = true; // Устанавливаем флаг окончания игры
        document.body.classList.add('game-over');
        alert("Game Over! Score: " + score);

        // Перезапуск игры через небольшой интервал
        setTimeout(startGame, 100);
    }
}

function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    direction = null;
    food = generateFood();
    score = 0;
    document.getElementById("score").innerText = score;
    document.body.classList.remove('game-over');
    gameOverFlag = false; // Сбрасываем флаг при перезапуске игры
    clearInterval(game); // Останавливаем текущий интервал
    game = setInterval(drawGame, gameSpeed); // Устанавливаем новый интервал
}

document.addEventListener("keydown", changeDirection);

// Добавляем обработчик кликов на игровом экране
canvas.addEventListener("click", handleClick);

// Отключаем скроллинг на мобильных при свайпах
canvas.addEventListener("touchmove", function(event) {
    event.preventDefault();
}, { passive: false });

document.getElementById("restart").addEventListener("click", startGame);

startGame();
