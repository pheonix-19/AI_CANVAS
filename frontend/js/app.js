document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const recognizeBtn = document.getElementById('recognize-btn');
    const textResultsPanel = document.getElementById('text-results');
    const shapeResultsPanel = document.getElementById('shape-results');
    const textOutput = document.getElementById('text-output');
    const latexCode = document.getElementById('latex-code');
    const latexRendered = document.getElementById('latex-rendered');
    const shapeData = document.getElementById('shape-data');
    const modeRadios = document.querySelectorAll('input[name="mode"]');

    // Initialize services
    const recognitionService = new RecognitionService();
    const shapeRenderer = new ShapeRenderer('shapes-canvas');

    // Default mode
    let currentMode = 'text';

    // Event listeners
    recognizeBtn.addEventListener('click', handleRecognition);

    modeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentMode = e.target.value;
            updateUI();
        });
    });

    // Update UI on load
    updateUI();

    // Main recognition handler
    async function handleRecognition() {
        try {
            // Button state
            recognizeBtn.disabled = true;
            recognizeBtn.textContent = 'Processing...';

            // Send request
            const result = await recognitionService.recognizeContent(currentMode);

            // Handle response
            if (currentMode === 'text') {
                displayTextResults(result);
            } else if (currentMode === 'shape') {
                displayShapeResults(result);
            }
        } catch (error) {
            alert(`Recognition failed: ${error.message}`);
            console.error('Recognition error:', error);
        } finally {
            // Restore button
            recognizeBtn.disabled = false;
            recognizeBtn.textContent = 'Recognize';
        }
    }

    function displayTextResults(result) {
        textOutput.textContent = result.text || 'No text recognized';
        latexCode.textContent = result.latex || '';
        latexRendered.innerHTML = '';

        if (result.latex) {
            const mathElement = document.createElement('div');
            mathElement.innerHTML = `\\[${result.latex}\\]`;
            latexRendered.appendChild(mathElement);

            if (window.MathJax) {
                MathJax.typesetPromise([latexRendered]).catch(err => {
                    console.error('MathJax rendering error:', err);
                });
            }
        }
    }

    function displayShapeResults(result) {
        shapeData.textContent = JSON.stringify(result.shapes, null, 2);
        shapeRenderer.renderShapes(result.shapes);
    }

    function updateUI() {
        if (currentMode === 'text') {
            textResultsPanel.style.display = 'block';
            shapeResultsPanel.style.display = 'none';
        } else if (currentMode === 'shape') {
            textResultsPanel.style.display = 'none';
            shapeResultsPanel.style.display = 'block';
        }
    }
});
