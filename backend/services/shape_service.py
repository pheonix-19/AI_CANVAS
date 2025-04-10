import numpy as np
import google.generativeai as genai
from PIL import Image
import io
import json

def recognize_shapes(image_np):
    """
    Recognize hand-drawn shapes from an image and convert to precise shapes.
    
    Args:
        image_np: Numpy array of the image
    
    Returns:
        List of recognized shapes with their properties
    """
    # Convert numpy array back to image
    image = Image.fromarray(image_np)
    
    # Convert to bytes
    image_bytes = io.BytesIO()
    image.save(image_bytes, format='PNG')
    image_bytes = image_bytes.getvalue()
    
    # Create a Gemini model instance
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Generate shapes using the image
    prompt = """
    Analyze this hand-drawn image and identify all shapes.
    For each shape, provide:
    1. The type of shape (rectangle, circle, triangle, line, etc.)
    2. The coordinates of key points (e.g., corners for rectangles, center and radius for circles)
    3. Any other relevant properties
    
    Return the data as a JSON array of shape objects with properties.
    Example format:
    [
      {
        "type": "rectangle",
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 100
      },
      {
        "type": "circle",
        "centerX": 300,
        "centerY": 200,
        "radius": 50
      }
    ]
    """
    
    response = model.generate_content([prompt, image_bytes])
    
    # Extract JSON data from response
    response_text = response.text
    
    # Find JSON data in the response
    try:
        # First try direct parsing
        shapes = json.loads(response_text)
    except json.JSONDecodeError:
        # If direct parsing fails, try to extract JSON from text
        start_idx = response_text.find('[')
        end_idx = response_text.rfind(']') + 1
        
        if start_idx >= 0 and end_idx > start_idx:
            json_str = response_text[start_idx:end_idx]
            try:
                shapes = json.loads(json_str)
            except json.JSONDecodeError:
                # If still fails, return a simplified response
                shapes = [{"error": "Could not parse shapes from response"}]
        else:
            shapes = [{"error": "No JSON data found in response"}]
    
    return shapes