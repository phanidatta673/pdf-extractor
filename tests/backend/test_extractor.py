import os
import json
import pytest
import boto3
import fitz
from moto import mock_aws
from fastapi.testclient import TestClient
from backend.main import app

# Set dummy AWS credentials for moto
os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_SECURITY_TOKEN"] = "testing"
os.environ["AWS_SESSION_TOKEN"] = "testing"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
BUCKET_NAME = "test-bucket"
os.environ["S3_BUCKET_NAME"] = BUCKET_NAME

client = TestClient(app)

@pytest.fixture
def sample_pdf():
    # Create a simple PDF in memory
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Hello World!")
    pdf_bytes = doc.write()
    doc.close()
    return pdf_bytes

@mock_aws
def test_extract_service(sample_pdf):
    # This test will fail because backend.services.extractor is not implemented yet
    from backend.services.extractor import PDFExtractor
    
    extractor = PDFExtractor()
    result = extractor.extract_from_bytes(sample_pdf)
    
    assert "metadata" in result
    assert "pages" in result
    assert result["pages"][0]["text"].strip() == "Hello World!"
    assert result["metadata"]["pages"] == 1

@mock_aws
def test_extract_endpoint(sample_pdf):
    # Setup: Create bucket and upload file
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket="test-bucket")
    
    s3_key = "uploads/test.pdf"
    s3.put_object(Bucket="test-bucket", Key=s3_key, Body=sample_pdf)
    
    # This will fail because POST /extract is not implemented yet
    response = client.post("/extract", json={"s3_key": s3_key})
    
    if response.status_code != 200:
        print(f"Response error: {response.json()}")
    
    assert response.status_code == 200
    data = response.json()
    assert "metadata" in data
    assert "pages" in data
    assert data["pages"][0]["text"].strip() == "Hello World!"
    
    # Check if result is saved in S3
    result_key = f"results/{s3_key}.json"
    s3_response = s3.get_object(Bucket="test-bucket", Key=result_key)
    result_from_s3 = json.loads(s3_response["Body"].read())
    assert result_from_s3 == data
