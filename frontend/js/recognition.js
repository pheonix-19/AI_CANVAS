class RecognitionService {
    constructor(apiUrl = 'http://127.0.0.1:5000/api') {
        this.apiUrl = apiUrl;
    }

    async recognizeContent(mode = 'text') {
        try {
            // Check if DrawingCanvas is available
            if (!window.drawingCanvas || !window.drawingCanvas.getImageData) {
                throw new Error("DrawingCanvas is not initialized or missing.");
            }

            // Get base64 image from canvas
            const base64Image = window.drawingCanvas.getImageData();

            const response = await fetch(`${this.apiUrl}/recognize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: base64Image,
                    mode: mode
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Recognition failed');
            }

            return await response.json();

        } catch (error) {
            console.error('Recognition error:', error);
            throw error;
        }
    }
}


class ShapeRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderShapes(shapes) {
        this.clearCanvas();

        shapes.forEach(shape => {
            switch (shape.type.toLowerCase()) {
                case 'rectangle':
                    this.drawRectangle(shape);
                    break;
                case 'circle':
                    this.drawCircle(shape);
                    break;
                case 'triangle':
                    this.drawTriangle(shape);
                    break;
                case 'line':
                    this.drawLine(shape);
                    break;
                case 'ellipse':
                    this.drawEllipse(shape);
                    break;
                case 'polygon':
                    this.drawPolygon(shape);
                    break;
                default:
                    console.log('Unknown shape type:', shape.type);
            }
        });
    }

    drawRectangle(rect) {
        this.ctx.beginPath();
        this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.strokeStyle = '#0066ff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawCircle(circle) {
        this.ctx.beginPath();
        this.ctx.arc(circle.centerX, circle.centerY, circle.radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#0066ff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawTriangle(triangle) {
        if (triangle.points && triangle.points.length === 3) {
            this.ctx.beginPath();
            this.ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
            this.ctx.lineTo(triangle.points[1].x, triangle.points[1].y);
            this.ctx.lineTo(triangle.points[2].x, triangle.points[2].y);
            this.ctx.closePath();
            this.ctx.strokeStyle = '#0066ff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        } else if (
            triangle.x1 !== undefined &&
            triangle.y1 !== undefined &&
            triangle.x2 !== undefined &&
            triangle.y2 !== undefined &&
            triangle.x3 !== undefined &&
            triangle.y3 !== undefined
        ) {
            this.ctx.beginPath();
            this.ctx.moveTo(triangle.x1, triangle.y1);
            this.ctx.lineTo(triangle.x2, triangle.y2);
            this.ctx.lineTo(triangle.x3, triangle.y3);
            this.ctx.closePath();
            this.ctx.strokeStyle = '#0066ff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    drawLine(line) {
        this.ctx.beginPath();
        this.ctx.moveTo(line.x1, line.y1);
        this.ctx.lineTo(line.x2, line.y2);
        this.ctx.strokeStyle = '#0066ff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawEllipse(ellipse) {
        this.ctx.beginPath();
        this.ctx.ellipse(
            ellipse.centerX,
            ellipse.centerY,
            ellipse.radiusX,
            ellipse.radiusY,
            ellipse.rotation || 0,
            0,
            2 * Math.PI
        );
        this.ctx.strokeStyle = '#0066ff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawPolygon(polygon) {
        if (polygon.points && polygon.points.length > 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(polygon.points[0].x, polygon.points[0].y);

            for (let i = 1; i < polygon.points.length; i++) {
                this.ctx.lineTo(polygon.points[i].x, polygon.points[i].y);
            }

            this.ctx.closePath();
            this.ctx.strokeStyle = '#0066ff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
}
