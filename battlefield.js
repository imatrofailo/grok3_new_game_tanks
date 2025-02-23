export class Battlefield {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.obstacles = [];
        this.eagle = null;
        this.projectiles = [];
    }

    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
    }

    setEagle(eagle) {
        this.eagle = eagle;
    }

    addProjectile(projectile) {
        this.projectiles.push(projectile);
    }

    updateProjectiles() {
        this.projectiles.forEach(proj => {
            proj.update();
            if (proj.x < 0 || proj.x > this.width || proj.y < 0 || proj.y > this.height) {
                proj.active = false;
            }
            this.obstacles.forEach(obstacle => {
                if (!obstacle.destroyed && this.pointInRect(proj.x, proj.y, obstacle)) {
                    proj.active = false;
                    obstacle.takeDamage();
                }
            });
        });
        this.projectiles = this.projectiles.filter(proj => proj.active);
    }

    checkTankCollision(tank) {
        if (tank.x < 0 || tank.x + tank.width > this.width || tank.y < 0 || tank.y + tank.height > this.height) {
            return true;
        }
        return this.obstacles.some(obstacle => !obstacle.destroyed && this.isColliding(tank, obstacle));
    }

    checkEagleCollection(tank) {
        return this.isColliding(tank, this.eagle);
    }

    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.size &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.size &&
               obj1.y + obj1.height > obj2.y;
    }

    pointInRect(px, py, rect) {
        return px >= rect.x && px <= rect.x + (rect.size || rect.width) &&
               py >= rect.y && py <= rect.y + (rect.size || rect.height);
    }
}
