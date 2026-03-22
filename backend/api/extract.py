import os
import json
import boto3
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.extractor import PDFExtractor

router = APIRouter()

def get_bucket_name():
    return os.getenv("S3_BUCKET_NAME", "pdf-extractor-uploads")

class ExtractRequest(BaseModel):
    s3_key: str

@router.post("/extract")
async def extract_pdf(request: ExtractRequest):
    """
    Downloads a PDF from S3 using the provided key, extracts text and metadata,
    saves the result as a JSON file in S3, and returns the result.
    """
    s3_client = boto3.client("s3")
    extractor = PDFExtractor()
    bucket_name = get_bucket_name()
    
    try:
        # 1. Download the PDF file from S3
        response = s3_client.get_object(Bucket=bucket_name, Key=request.s3_key)
        pdf_bytes = response["Body"].read()
        
        # 2. Extract text using the service
        result = extractor.extract_from_bytes(pdf_bytes)
        
        # 3. Save the extraction result (JSON) back to S3
        # e.g., results/uploads/uuid.pdf.json
        result_key = f"results/{request.s3_key}.json"
        s3_client.put_object(
            Bucket=bucket_name,
            Key=result_key,
            Body=json.dumps(result),
            ContentType="application/json"
        )
        
        # 4. Return the extraction results to the user
        return result
        
    except s3_client.exceptions.NoSuchKey:
        raise HTTPException(status_code=404, detail=f"S3 key '{request.s3_key}' not found.")
    except Exception as e:
        # In a real app, we'd log this error
        raise HTTPException(status_code=500, detail=str(e))
