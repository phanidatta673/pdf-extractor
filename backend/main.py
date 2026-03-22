from fastapi import FastAPI
from mangum import Mangum
from backend.api.upload import router as upload_router
from backend.api.extract import router as extract_router

app = FastAPI(title="PDF Extractor API")

app.include_router(upload_router)
app.include_router(extract_router)

@app.get("/")
def read_root():
    return {"message": "PDF Extractor API is running"}

handler = Mangum(app)
