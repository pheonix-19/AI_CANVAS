import numpy as np
import google.generativeai as genai
from PIL import Image
import io

def recognize_text(image_np):
    """
    Recognize handwritten text from an image using Gemini Vision.
    
    Args:
        image_np: Numpy array of the image
    
    Returns:
        Recognized text string
    """
    # Convert numpy array back to image
    image = Image.fromarray(image_np)
    
    # Convert to bytes
    image_bytes = io.BytesIO()
    image.save(image_bytes, format='PNG')
    image_bytes = image_bytes.getvalue()
    
    # Create a Gemini model instance
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Generate content using the image
    response = model.generate_content([
        "Identify and extract all handwritten text from this image. Return only the text, no explanations.",
        image_bytes
    ])
    
    return response.text

def convert_to_latex(text):
    """
    Convert mathematical text to LaTeX format using Gemini.
    
    Args:
        text: Text to convert to LaTeX
    
    Returns:
        LaTeX formatted string
    """
    # Create a Gemini model instance
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Generate LaTeX from text
    prompt = f"""
    Convert the following mathematical expression to LaTeX format.
    Only return the LaTeX code without explanations or markdown.
    
    Expression: {text}
    """
    
    response = model.generate_content(prompt)
    
    # Clean up the response to get just the LaTeX code
    latex = response.text.strip()
    if latex.startswith('```latex'):
        latex = latex[8:]
    if latex.endswith('```'):
        latex = latex[:-3]
    
    return latex.strip()