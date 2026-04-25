from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from pdf2image import convert_from_path
import os

# Ensure homebrew paths are in PATH so tesseract and poppler can be found
os.environ['PATH'] += os.pathsep + '/opt/homebrew/bin' + os.pathsep + '/usr/local/bin'

app = Flask(__name__)
# Enable CORS so the React Native app can make requests to this API
CORS(app)

@app.route('/ocr', methods=['POST'])
def ocr():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    import traceback
    
    # Use the original extension or fallback to .pdf
    ext = os.path.splitext(file.filename)[1]
    if not ext:
        ext = '.pdf'
    temp_path = f"temp{ext}"
    file.save(temp_path)

    try:
        text = ""
        # If it's a PDF, convert it to images first
        if ext.lower() == '.pdf':
            # Lowering DPI from 300 to 200 speeds up conversion by ~50%
            # thread_count=4 makes poppler process pages in parallel
            pages = convert_from_path(temp_path, 200, thread_count=4)
            
            import concurrent.futures
            # Process pages in parallel using threads to massively speed up pytesseract
            with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
                results = list(executor.map(pytesseract.image_to_string, pages))
            text = "\n".join(results)
        else:
            # Otherwise, treat it directly as an image
            from PIL import Image
            img = Image.open(temp_path)
            # Resize image if it's too large to speed up OCR
            img.thumbnail((2000, 2000))
            text = pytesseract.image_to_string(img)

        return jsonify({"text": text})
    except Exception as e:
        print("OCR Error:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    # Run on all interfaces so the mobile app can access it via local network IP
    app.run(host='0.0.0.0', port=5001, debug=True)
