from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import io
from PIL import Image
import numpy as np
import google.generativeai as genai
import os
from services.text_service import recognize_text, convert_to_latex
from services.shape_service import recognize_shapes
import os
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure Gemini API
API_KEY = os.getenv("API_KEY")
# API_KEY = os.environ.get("GEMINI_API_KEY", "your-api-key-here")
genai.configure(api_key=API_KEY)

@app.route('/api/recognize', methods=['POST'])
def recognize():
    data = request.json
    image_data = data.get('image')
    mode = data.get('mode', 'text')  # 'text' or 'shape'
    
    if not image_data:
        return jsonify({"error": "No image data provided"}), 400
    
    try:
        # Convert base64 image to numpy array
        image_data = image_data.split(',')[1]
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        image_np = np.array(image)
        
        if mode == 'text':
            # Recognize text and convert to LaTeX
            text = recognize_text(image_np)
            latex = convert_to_latex(text)
            return jsonify({"text": text, "latex": latex})
        
        elif mode == 'shape':
            # Recognize shapes
            shapes = recognize_shapes(image_np)
            return jsonify({"shapes": shapes})
        
        else:
            return jsonify({"error": "Invalid mode"}), 400
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)