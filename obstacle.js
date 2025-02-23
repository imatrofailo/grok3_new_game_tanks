export class Obstacle {
    constructor(x, y, size, imagePath) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.health = 3;
        this.destroyed = false;
        
        // Load the obstacle image
        this.image = new Image();
        this.image.src = imagePath;
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    takeDamage() {
        if (!this.destroyed) {
            this.health -= 1;
            if (this.health <= 0) this.destroyed = true;
        }
    }
}
