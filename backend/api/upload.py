import os
import uuid
import boto3
from fastapi import APIRouter

router = APIRouter()

def get_bucket_name():
    return os.getenv("S3_BUCKET_NAME", "pdf-extractor-uploads")

@router.get("/upload-url")
def get_upload_url():
    """
    Generates a pre-signed URL for uploading a PDF file to S3.
    Enforces a 50MB size limit.
    """
    s3_client = boto3.client("s3")
    bucket_name = get_bucket_name()
    object_key = f"uploads/{uuid.uuid4()}.pdf"
    
    # We use generate_presigned_post instead of generate_presigned_url 
    # because only generate_presigned_post supports conditions like 
    # content-length-range to enforce size limits (50MB).
    response = s3_client.generate_presigned_post(
        Bucket=bucket_name,
        Key=object_key,
        Fields={"Content-Type": "application/pdf"},
        Conditions=[
            ["content-length-range", 0, 50 * 1024 * 1024],  # 50MB limit
            {"Content-Type": "application/pdf"}
        ],
        ExpiresIn=3600
    )
    
    return response
