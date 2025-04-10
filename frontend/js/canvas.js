class DrawingCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isDrawing = false;
        this.history = [];
        this.redoStack = [];
        this.currentPath = [];
        this.brushColor = '#000000';
        this.brushSize = 3;
        
        this.setupEventListeners();
        this.saveState(); // Save initial blank state
    }
    
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.draw.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup');
            this.canvas.dispatchEvent(mouseEvent);
        });
        
        // Color and brush size
        document.getElementById('color-picker').addEventListener('input', (e) => {
            this.brushColor = e.target.value;
        });
        
        document.getElementById('brush-size').addEventListener('input', (e) => {
            this.brushSize = parseInt(e.target.value);
        });
        
        // Clear and undo buttons
        document.getElementById('clear-btn').addEventListener('click', this.clearCanvas.bind(this));
        document.getElementById('undo-btn').addEventListener('click', this.undo.bind(this));
    }
    
    startDrawing(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.isDrawing = true;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        // Start a new path
        this.currentPath = [{
            type: 'start',
            x: x,
            y: y,
            color: this.brushColor,
            size: this.brushSize
        }];
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.lineTo(x, y);
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();
        
        // Add to current path
        this.currentPath.push({
            type: 'line',
            x: x,
            y: y
        });
    }
    
    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            // Save current state to history
            this.saveState();
            this.redoStack = []; // Clear redo stack
        }
    }
    
    saveState() {
        // Save current canvas state
        const state = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.history.push({
            imageData: state,
            path: [...this.currentPath]
        });
        
        // Limit history size to prevent memory issues
        if (this.history.length > 30) {
            this.history.shift();
        }
    }
    
    undo() {
        if (this.history.length <= 1) return; // Keep at least the initial state
        
        // Save current state to redo stack
        const currentState = this.history.pop();
        this.redoStack.push(currentState);
        
        // Restore previous state
        const previousState = this.history[this.history.length - 1];
        this.ctx.putImageData(previousState.imageData, 0, 0);
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
        this.redoStack = []; // Clear redo stack
    }
    
    getImageData() {
        // Return canvas as data URL (PNG format)
        return this.canvas.toDataURL('image/png');
    }
}

// Initialize canvas when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.drawingCanvas = new DrawingCanvas('drawing-canvas');
});