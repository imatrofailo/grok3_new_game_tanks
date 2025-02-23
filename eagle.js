export class Eagle {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        
        // Load the eagle image
        this.image = new Image();
        this.image.src = './textures/eagle.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }
}
