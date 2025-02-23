import { Tank } from './tank.js';
import { Projectile } from './projectile.js';
import { Obstacle } from './obstacle.js';
import { Eagle } from './eagle.js';
import { Battlefield } from './battlefield.js';
import { Score } from './score.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        console.log('Canvas found, initializing game...');
        
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 600;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        // Define obstacle textures
        this.obstacleTextures = [
            './textures/obstacle_1.png',
            './textures/obstacle_2.png',
            './textures/obstacle_3.png'
        ];

        console.log('Starting game initialization...');
        this.initGame();
        this.keys = {};
        window.addEventListener('keydown', e => this.keys[e.key] = true);
        window.addEventListener('keyup', e => this.keys[e.key] = false);
        console.log('Game initialized, starting game loop...');

        this.gameLoop();
    }

    initGame() {
        this.battlefield = new Battlefield(this.width, this.height);
        this.score = new Score();
        
        const obstacleSize = 40; // Slightly smaller to fit more obstacles
        
        // Initialize tanks in opposite corners with clear paths
        this.playerTank = new Tank(obstacleSize * 2, obstacleSize * 2, 0, './textures/yellow.png');
        this.computerTank = new Tank(this.width - obstacleSize * 3, this.height - obstacleSize * 3, 180, './textures/blue.png');
        
        // Create perimeter walls with random textures
        this.createPerimeterWalls(obstacleSize);
        
        // Setup eagle in the center
        const eagleSize = 40;
        const eagleX = this.width / 2 - eagleSize / 2;
        const eagleY = this.height / 2 - eagleSize / 2;
        this.battlefield.setEagle(new Eagle(eagleX, eagleY, eagleSize));
        
        // Create random obstacles
        this.createRandomObstacles(obstacleSize);

        this.gameState = 'playing';
    }

    getRandomTexture() {
        return this.obstacleTextures[Math.floor(Math.random() * this.obstacleTextures.length)];
    }

    createPerimeterWalls(size) {
        // Top and bottom walls
        for (let x = 0; x < this.width; x += size) {
            this.battlefield.addObstacle(new Obstacle(x, 0, size, this.getRandomTexture())); // Top
            this.battlefield.addObstacle(new Obstacle(x, this.height - size, size, this.getRandomTexture())); // Bottom
        }
        // Left and right walls
        for (let y = size; y < this.height - size; y += size) {
            this.battlefield.addObstacle(new Obstacle(0, y, size, this.getRandomTexture())); // Left
            this.battlefield.addObstacle(new Obstacle(this.width - size, y, size, this.getRandomTexture())); // Right
        }
    }

    createRandomObstacles(size) {
        const numObstacles = 30; // Adjust this number to control obstacle density
        const safeRadius = size * 3; // Keep area around tanks and eagle clear
        
        for (let i = 0; i < numObstacles; i++) {
            let x, y;
            let validPosition = false;
            
            // Try to find a valid position that doesn't overlap with tanks or eagle
            while (!validPosition) {
                x = Math.floor(Math.random() * (this.width - size * 2) + size);
                y = Math.floor(Math.random() * (this.height - size * 2) + size);
                
                // Check distance from tanks and eagle
                const distFromPlayer = Math.hypot(x - this.playerTank.x, y - this.playerTank.y);
                const distFromComputer = Math.hypot(x - this.computerTank.x, y - this.computerTank.y);
                const distFromEagle = Math.hypot(x - this.width/2, y - this.height/2);
                
                if (distFromPlayer > safeRadius && distFromComputer > safeRadius && distFromEagle > safeRadius) {
                    validPosition = true;
                }
            }
            
            // Create obstacle cluster (2-3 obstacles together)
            const clusterSize = Math.floor(Math.random() * 2) + 2;
            for (let j = 0; j < clusterSize; j++) {
                const offsetX = (Math.random() - 0.5) * size * 2;
                const offsetY = (Math.random() - 0.5) * size * 2;
                this.battlefield.addObstacle(new Obstacle(
                    x + offsetX,
                    y + offsetY,
                    size,
                    this.getRandomTexture()
                ));
            }
        }
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        if (this.gameState !== 'playing') return;

        // Player controls
        if (this.keys['ArrowLeft']) this.playerTank.rotateLeft();
        if (this.keys['ArrowRight']) this.playerTank.rotateRight();
        if (this.keys['ArrowUp']) {
            const tempX = this.playerTank.x, tempY = this.playerTank.y;
            this.playerTank.moveForward();
            if (this.battlefield.checkTankCollision(this.playerTank)) {
                this.playerTank.x = tempX;
                this.playerTank.y = tempY;
            }
        }
        if (this.keys['ArrowDown']) {
            const tempX = this.playerTank.x, tempY = this.playerTank.y;
            this.playerTank.moveBackward();
            if (this.battlefield.checkTankCollision(this.playerTank)) {
                this.playerTank.x = tempX;
                this.playerTank.y = tempY;
            }
        }
        if (this.keys[' ']) {
            const shot = this.playerTank.shoot();
            if (shot) this.battlefield.addProjectile(new Projectile(shot.x, shot.y, shot.angle));
        }

        // Computer AI (simple but fun)
        if (Math.random() < 0.03) this.computerTank.rotateLeft();
        if (Math.random() < 0.03) this.computerTank.rotateRight();
        const tempX = this.computerTank.x, tempY = this.computerTank.y;
        this.computerTank.moveForward();
        if (this.battlefield.checkTankCollision(this.computerTank)) {
            this.computerTank.x = tempX;
            this.computerTank.y = tempY;
            this.computerTank.rotateRight();
        }
        if (Math.random() < 0.02) {
            const shot = this.computerTank.shoot();
            if (shot) this.battlefield.addProjectile(new Projectile(shot.x, shot.y, shot.angle));
        }

        // Update projectiles and check hits
        this.battlefield.updateProjectiles();
        this.battlefield.projectiles.forEach(proj => {
            if (proj.active) {
                if (this.battlefield.pointInRect(proj.x, proj.y, this.playerTank)) {
                    proj.active = false;
                    this.score.incrementComputerHits();
                }
                if (this.battlefield.pointInRect(proj.x, proj.y, this.computerTank)) {
                    proj.active = false;
                    this.score.incrementPlayerHits();
                }
            }
        });

        // Check eagle collection
        if (this.battlefield.checkEagleCollection(this.playerTank)) {
            alert('Player collects the Golden Eagle and wins!');
            this.restart();
        } else if (this.battlefield.checkEagleCollection(this.computerTank)) {
            alert('Computer collects the Golden Eagle and wins!');
            this.restart();
        }
    }

    render() {
        this.ctx.fillStyle = '#000000'; // Black battlefield
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw obstacles
        this.battlefield.obstacles.forEach(obstacle => {
            if (!obstacle.destroyed) {
                if (obstacle.imageLoaded) {
                    this.ctx.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.size, obstacle.size);
                } else {
                    // Fallback if image hasn't loaded
                    this.ctx.fillStyle = `rgb(${150 - obstacle.health * 50}, 100, 100)`;
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
                }
                // Draw health indicator
                this.ctx.fillStyle = 'white';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(obstacle.health, obstacle.x + obstacle.size / 2 - 5, obstacle.y + obstacle.size / 2 + 5);
            }
        });

        // Draw eagle
        if (this.battlefield.eagle.imageLoaded) {
            this.ctx.drawImage(
                this.battlefield.eagle.image,
                this.battlefield.eagle.x,
                this.battlefield.eagle.y,
                this.battlefield.eagle.size,
                this.battlefield.eagle.size
            );
        } else {
            // Fallback animation if image hasn't loaded
            this.ctx.fillStyle = `hsl(${Date.now() % 360}, 100%, 50%)`;
            this.ctx.fillRect(
                this.battlefield.eagle.x,
                this.battlefield.eagle.y,
                this.battlefield.eagle.size,
                this.battlefield.eagle.size
            );
        }

        // Draw tanks
        this.drawTank(this.playerTank);
        this.drawTank(this.computerTank);

        // Draw projectiles
        this.ctx.fillStyle = 'white';
        this.battlefield.projectiles.forEach(proj => {
            if (proj.active) this.ctx.fillRect(proj.x, proj.y, proj.size, proj.size);
        });

        // Draw score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Player: ${this.score.playerHits}  Computer: ${this.score.computerHits}`, 10, 30);
    }

    drawTank(tank) {
        this.ctx.save();
        this.ctx.translate(tank.x + tank.width / 2, tank.y + tank.height / 2);
        this.ctx.rotate(tank.angle * Math.PI / 180);
        
        if (tank.imageLoaded) {
            // Draw the tank image
            this.ctx.drawImage(
                tank.image,
                -tank.width / 2,
                -tank.height / 2,
                tank.width,
                tank.height
            );
        } else {
            // Fallback to rectangle if image hasn't loaded
            this.ctx.fillStyle = tank === this.playerTank ? 'yellow' : 'blue';
            this.ctx.fillRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);
        }

        // Draw the barrel
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(tank.barrelLength, 0);
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    restart() {
        this.score.reset();
        this.initGame();
    }
}
