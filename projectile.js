export class Projectile {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 5;
        this.size = 5;
        this.active = true;
    }

    update() {
        if (!this.active) return;
        const rad = this.angle * Math.PI / 180;
        this.x += this.speed * Math.cos(rad);
        this.y += this.speed * Math.sin(rad);
    }
}
