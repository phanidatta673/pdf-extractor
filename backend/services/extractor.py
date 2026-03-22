import fitz

class PDFExtractor:
    def extract_from_bytes(self, pdf_bytes: bytes):
        """
        Extracts text and metadata from PDF bytes using PyMuPDF (fitz).
        """
        # Open PDF from memory stream
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        
        metadata = {
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", ""),
            "subject": doc.metadata.get("subject", ""),
            "keywords": doc.metadata.get("keywords", ""),
            "creator": doc.metadata.get("creator", ""),
            "producer": doc.metadata.get("producer", ""),
            "creationDate": doc.metadata.get("creationDate", ""),
            "modDate": doc.metadata.get("modDate", ""),
            "pages": doc.page_count
        }
        
        pages = []
        for i in range(doc.page_count):
            page = doc.load_page(i)
            pages.append({
                "page_number": i + 1,
                "text": page.get_text()
            })
            
        doc.close()
        
        return {
            "metadata": metadata,
            "pages": pages
        }
