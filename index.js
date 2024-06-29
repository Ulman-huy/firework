// Constants
const WINDOWWIDTH = window.innerWidth
const WINDOWHEIGHT = window.innerHeight;
const FPS = 60;
const SIZE = 2.2;
const SPEED_CHANGE_SIZE = 0.05;
const CHANGE_SPEED = 0.07;
const RAD = Math.PI / 180;
const A_FALL = 1.5;
const NUM_BULLET = 100;
const SPEED_MIN = 2;
const SPEED_MAX = 4;
const TIME_CREAT_FW = 40;
const NUM_FIREWORKS_MAX = 10;
const NUM_FIREWORKS_MIN = 2;
const SPEED_FLY_UP_MAX = 15;
const SPEED_FLY_UP_MIN = 8;
console.log({window});
const BLACK = "#000000";
const WHITE = "#FFFFFF";
const FONT_SIZE = 24;

class Dot {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
    }

    update() {
        if (this.size > 0) {
            this.size -= SPEED_CHANGE_SIZE * 5;
        } else {
            this.size = 0;
        }
    }

    draw(context) {
        if (this.size > 0) {
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            context.fillStyle = this.color;
            context.fill();
            context.closePath();
        }
    }
}

class BulletFlyUp {
    constructor(speed, x) {
        this.speed = speed;
        this.x = x;
        this.y = WINDOWHEIGHT;
        this.dots = [];
        this.size = SIZE / 2;
        this.color = "#FFFF64";
    }

    update() {
        this.dots.push(new Dot(this.x, this.y, this.size, this.color));
        this.y -= this.speed;
        this.speed -= A_FALL * 0.1;
        for (const dot of this.dots) {
            dot.update();
        }
        this.dots = this.dots.filter((dot) => dot.size > 0);
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();

        for (const dot of this.dots) {
            dot.draw(context);
        }
    }
}

class Bullet {
    constructor(x, y, speed, angle, color) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.angle = angle;
        this.size = SIZE;
        this.color = color;
    }

    update() {
        const speedX = this.speed * Math.cos(this.angle * RAD);
        const speedY = this.speed * -Math.sin(this.angle * RAD);
        this.x += speedX;
        this.y += speedY;
        this.y += A_FALL;
        if (this.size > 0) {
            this.size -= SPEED_CHANGE_SIZE;
        } else {
            this.size = 0;
        }
        if (this.speed > 0) {
            this.speed -= CHANGE_SPEED;
        } else {
            this.speed = 0;
        }
    }

    draw(context) {
        if (this.size > 0) {
            context.beginPath();
            context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
            context.fillStyle = this.color;
            context.fill();
            context.closePath();
        }
    }
}

class FireWork {
    constructor(x, y) {
        this.x = x;
        this.y = y - 180;
        this.dots = [];
        this.bullets = [];
        this.bullets = this.createBullets();
    }

    getRandomColor() {
        const color1 = Math.floor(Math.random() * 256);
        const color2 = Math.floor(Math.random() * 256);
        const color3 =
            color1 + color2 >= 255
                ? Math.floor(Math.random() * 256)
                : Math.floor(Math.random() * (255 - color1 - color2) + 255);
        return `rgb(${color1}, ${color2}, ${color3})`;
    }

    getRandomSpeed() {
        return Math.random() * (SPEED_MAX - SPEED_MIN) + SPEED_MIN;
    }

    createBullets() {
        const bullets = [];
        const color = this.getRandomColor();
        for (let i = 0; i < NUM_BULLET; i++) {
            const angle = (300 / NUM_BULLET) * i;
            const speed = this.getRandomSpeed();
            bullets.push(new Bullet(this.x, this.y, speed, angle, color));
        }
        return bullets;
    }

    update() {
        for (const bullet of this.bullets) {
            bullet.update();
            this.dots.push(new Dot(bullet.x, bullet.y, bullet.size, bullet.color));
        }
        for (const dot of this.dots) {
            dot.update();
        }
        this.dots = this.dots.filter((dot) => dot.size > 0);
    }

    draw(context) {
        for (const bullet of this.bullets) {
            bullet.draw(context);
        }
        for (const dot of this.dots) {
            dot.draw(context);
        }
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

class Main {
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.fireWorks = [];
        this.time = TIME_CREAT_FW;
        this.bulletFlyUps = [];
        this.startTime = new Date().getTime();
        this.countdownStartTime = this.startTime;
        this.newYearDisplayTime = this.startTime + 10000; // Display "HAPPY NEW YEAR!" after 10 seconds
        this.fireworkStartTime = this.startTime + 5000; // Start firing fireworks after 5 seconds
        this.explosionSound = new Audio("./firework.mp3");
        this.explosionSound.volume = 0.5;
        this.explosionSound.loop = true

        // Initialize canvas and start the main loop
        this.canvas.width = WINDOWWIDTH;
        this.canvas.height = WINDOWHEIGHT;
        this.mainLoop();
    }

    createFireWorks() {
        const numFireworks = getRandomInt(NUM_FIREWORKS_MIN, NUM_FIREWORKS_MAX);
        for (let i = 0; i < numFireworks; i++) {
            this.bulletFlyUps.push(
                new BulletFlyUp(getRandomFloat(SPEED_FLY_UP_MIN, SPEED_FLY_UP_MAX), getRandomInt(WINDOWWIDTH * 0.2, WINDOWWIDTH * 0.8))
            );
        }
    }

    update() {
        this.context.fillStyle = BLACK;
        this.context.fillRect(0, 0, WINDOWWIDTH, WINDOWHEIGHT);

        const currentTime = new Date().getTime();

        // Countdown from 5 to 1
        const countdown = 5 - Math.floor((currentTime - this.countdownStartTime) / 1000);
        if (countdown > 0) {
            this.context.fillStyle = WHITE;
            this.context.font = `${FONT_SIZE}px Arial`;
            this.context.fillText(countdown.toString(), WINDOWWIDTH / 2, WINDOWHEIGHT / 2);
        } else {
            // Display "HAPPY NEW YEAR!" after 10 seconds
            if (currentTime >= this.newYearDisplayTime) {
                this.context.fillStyle = WHITE;
                this.context.font = `${FONT_SIZE}px Arial`;
                this.context.fillText("HAPPY NEW YEAR!", WINDOWWIDTH / 2, WINDOWHEIGHT / 2);
            }
        }

        // Start firing fireworks after 5 seconds
        if (currentTime >= this.fireworkStartTime) {
            for (const fireWork of this.fireWorks) {
                if (fireWork.bullets[0].size <= 0) {
                    this.fireWorks.splice(this.fireWorks.indexOf(fireWork), 1);
                    // Play sound when a firework explodes
                    this.explosionSound.play();
                }
            }

            // Create new fireworks every 40 frames
            if (this.time === TIME_CREAT_FW) {
                this.createFireWorks();
            }

            // Update and draw bullet fly-ups
            for (const bulletFlyUp of this.bulletFlyUps) {
                bulletFlyUp.draw(this.context);
                bulletFlyUp.update();
            }

            // Update and draw fireworks
            for (const fireWork of this.fireWorks) {
                fireWork.draw(this.context);
                fireWork.update();
            }

            // Check if bullet fly-ups have reached the peak and create fireworks
            for (const bulletFlyUp of this.bulletFlyUps) {
                if (bulletFlyUp.speed <= 0) {
                    this.fireWorks.push(new FireWork(bulletFlyUp.x, bulletFlyUp.y));
                    this.bulletFlyUps.splice(this.bulletFlyUps.indexOf(bulletFlyUp), 1);
                }
            }

            // Increment the frame counter
            if (this.time <= TIME_CREAT_FW) {
                this.time += 1;
            } else {
                this.time = 0;
            }
        }

        requestAnimationFrame(() => this.update());
    }

    mainLoop() {
        this.update();
    }
}

// Create an instance of the Main class when the window loads
window.onload = function () {
    new Main();
};
