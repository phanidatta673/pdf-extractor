import os
import pytest
from fastapi.testclient import TestClient
from moto import mock_aws
import boto3

# Set dummy AWS credentials for moto
os.environ["AWS_ACCESS_KEY_ID"] = "testing"
os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
os.environ["AWS_SECURITY_TOKEN"] = "testing"
os.environ["AWS_SESSION_TOKEN"] = "testing"
os.environ["AWS_DEFAULT_REGION"] = "us-east-1"
os.environ["S3_BUCKET_NAME"] = "test-bucket"

from backend.main import app

client = TestClient(app)

@mock_aws
def test_get_upload_url():
    # Setup: Create the bucket
    s3 = boto3.client("s3", region_name="us-east-1")
    s3.create_bucket(Bucket="test-bucket")
    
    response = client.get("/upload-url")
    assert response.status_code == 200
    data = response.json()
    
    # Requirement: Return a JSON response with a pre-signed S3 URL.
    # The prompt says: "The GET /upload-url endpoint should return a JSON response with a pre-signed S3 URL."
    # It also says: "Use boto3.client('s3').generate_presigned_url."
    # AND "Include the Content-Length condition to enforce the 50MB limit".
    
    # Since generate_presigned_url doesn't support conditions, but generate_presigned_post does,
    # and the prompt is a bit contradictory, I'll check for "url" key.
    
    assert "url" in data
    # If using generate_presigned_url, data is {"url": "..."}
    # If using generate_presigned_post, data is {"url": "...", "fields": {...}}
    
    assert data["url"].startswith("http")
