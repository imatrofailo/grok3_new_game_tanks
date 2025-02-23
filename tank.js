export class Tank {
    constructor(x, y, angle, imagePath) {
        this.x = x;
        this.y = y;
        this.angle = angle; // Degrees: 0 = right, 90 = down, etc.
        this.speed = 2;
        this.rotationSpeed = 3;
        this.width = 30;
        this.height = 20;
        this.barrelLength = 20;
        this.lastShotTime = 0;
        this.fireRate = 500; // Milliseconds between shots
        
        // Create and load the tank image
        this.image = new Image();
        this.imageLoaded = false;
        console.log('Loading tank image:', imagePath);
        this.image.onload = () => {
            console.log('Tank image loaded successfully:', imagePath);
            this.imageLoaded = true;
        };
        this.image.onerror = (error) => {
            console.error('Error loading tank image:', imagePath, error);
        };
        this.image.src = imagePath;
    }

    moveForward() {
        const rad = this.angle * Math.PI / 180;
        this.x += this.speed * Math.cos(rad);
        this.y += this.speed * Math.sin(rad);
    }

    moveBackward() {
        const rad = this.angle * Math.PI / 180;
        this.x -= this.speed * Math.cos(rad);
        this.y -= this.speed * Math.sin(rad);
    }

    rotateLeft() {
        this.angle -= this.rotationSpeed;
        if (this.angle < 0) this.angle += 360;
    }

    rotateRight() {
        this.angle += this.rotationSpeed;
        if (this.angle >= 360) this.angle -= 360;
    }

    shoot() {
        const now = Date.now();
        if (now - this.lastShotTime >= this.fireRate) {
            this.lastShotTime = now;
            const rad = this.angle * Math.PI / 180;
            const projX = this.x + (this.width / 2) + this.barrelLength * Math.cos(rad);
            const projY = this.y + (this.height / 2) + this.barrelLength * Math.sin(rad);
            return { x: projX, y: projY, angle: this.angle };
        }
        return null;
    }
}
