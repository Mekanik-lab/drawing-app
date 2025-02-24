class DrawingApp {
    constructor() {
        this.canvas = document.getElementById('drawingCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.drawing = false;
        this.brushSize = 5;
        this.brushColor = '#ff0000';
        this.undoStack = [];
        this.redoStack = [];
        this.maxStackSize = 50;

        this.initCanvas();
        this.initControls();
        this.addEventListeners();
        this.saveState();
    }

    initCanvas() {
        this.resizeCanvas();
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    resizeCanvas() {
        const prevData = this.canvas.toDataURL();
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    
        const img = new Image();
        img.src = prevData;
        img.onload = () => {
            this.ctx.drawImage(img, 0, 0);
        };
    }
}

    }

    initControls() {
        this.controls = {
            undo: document.getElementById('undoCanvas'),
            redo: document.getElementById('redoCanvas'),
            clear: document.getElementById('clearCanvas'),
            download: document.getElementById('downloadCanvas'),
            brushSize: document.getElementById('brushSize'),
            brushSizeValue: document.getElementById('brushSizeValue'),
            colorPicker: document.getElementById('colorPicker'),
            colorDisplay: document.getElementById('colorDisplay'),
            toggleControls: document.getElementById('toggleControls'),
            toggleInfo: document.getElementById('toggleInfo')
        };

        this.controls.undo.disabled = true;
        this.controls.redo.disabled = true;
        this.controls.colorDisplay.style.backgroundColor = this.brushColor;
    }

    addEventListeners() {
        this.canvas.addEventListener('pointerdown', this.startDrawing.bind(this));
        this.canvas.addEventListener('pointermove', this.draw.bind(this));
        this.canvas.addEventListener('pointerup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('pointerout', this.stopDrawing.bind(this));

        this.controls.undo.addEventListener('click', this.undo.bind(this));
        this.controls.redo.addEventListener('click', this.redo.bind(this));
        this.controls.clear.addEventListener('click', this.clearCanvas.bind(this));
        this.controls.download.addEventListener('click', this.downloadCanvas.bind(this));
        this.controls.brushSize.addEventListener('input', this.changeBrushSize.bind(this));
        this.controls.colorPicker.addEventListener('input', this.changeBrushColor.bind(this));
        
        this.controls.toggleControls.addEventListener('click', () => {
            document.querySelector('.controls').classList.toggle('collapsed');
        });
        
        this.controls.toggleInfo.addEventListener('click', () => {
            document.querySelector('.info').classList.toggle('collapsed');
        });

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.updateInfo();
        });
        
        window.addEventListener('mousemove', this.updateInfo.bind(this));
    }

    startDrawing(event) {
        this.drawing = true;
        this.ctx.beginPath();
        this.ctx.moveTo(event.clientX, event.clientY);
        this.draw(event);
    }

    draw(event) {
        if (!this.drawing) return;

        this.ctx.lineWidth = this.brushSize;
        this.ctx.strokeStyle = this.brushColor;
        this.ctx.lineTo(event.clientX, event.clientY);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(event.clientX, event.clientY);
    }

    stopDrawing() {
        if (this.drawing) {
            this.drawing = false;
            this.ctx.beginPath();
            this.saveState();
        }
    }

    saveState() {
        this.undoStack.push(this.canvas.toDataURL());
        if (this.undoStack.length > this.maxStackSize) {
            this.undoStack.shift();
        }
        this.redoStack = [];
        this.updateUndoRedoButtons();
    }

    updateUndoRedoButtons() {
        this.controls.undo.disabled = this.undoStack.length <= 1;
        this.controls.redo.disabled = this.redoStack.length === 0;
    }

    undo() {
        if (this.undoStack.length <= 1) return;
        
        this.redoStack.push(this.undoStack.pop());
        const imgData = this.undoStack[this.undoStack.length - 1];
        this.loadCanvasState(imgData);
        this.updateUndoRedoButtons();
    }

    redo() {
        if (this.redoStack.length === 0) return;
        
        const imgData = this.redoStack.pop();
        this.undoStack.push(imgData);
        this.loadCanvasState(imgData);
        this.updateUndoRedoButtons();
    }

    loadCanvasState(dataUrl) {
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.saveState();
    }

    changeBrushSize(event) {
        this.brushSize = event.target.value;
        this.controls.brushSizeValue.textContent = this.brushSize;
    }

    changeBrushColor(event) {
        this.brushColor = event.target.value;
        this.controls.colorDisplay.style.backgroundColor = this.brushColor;
    }

    downloadCanvas() {
        const link = document.createElement('a');
        link.download = `drawing-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
    }

    updateInfo(event) {
        const info = document.querySelector('.info-content');
        const width = window.innerWidth;
        const height = window.innerHeight;
        const posX = event ? event.clientX : '---';
        const posY = event ? event.clientY : '---';

        info.innerHTML = `
            <div>Canvas Size:</div>
            <div>Width: ${width}px</div>
            <div>Height: ${height}px</div>
            <div>Cursor Position:</div>
            <div>X: ${posX}</div>
            <div>Y: ${posY}</div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DrawingApp();
});
