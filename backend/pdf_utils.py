import fitz
import pytesseract
from PIL import Image
import io

pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

def extract_text_from_pdf(file):
    if isinstance(file, bytes):
        data = file
    else:
        data = file.read()
    
    doc = fitz.open(stream=data, filetype="pdf")
    text = ""

    for page in doc:
        page_text = page.get_text()

        if page_text.strip():
            text += page_text
        else:
            pix = page.get_pixmap(dpi=200)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            text += pytesseract.image_to_string(img)

    if not text.strip():
        raise ValueError("Could not extract any text from this PDF.")

    return text[:4000]