# PDF Text Extractor

A high-fidelity, serverless PDF text extraction tool built with Next.js, FastAPI, and AWS.

## Overview

The PDF Text Extractor is designed for high-accuracy text and metadata extraction from PDF files. It leverages AWS S3 for direct-to-cloud uploads (bypassing API limits), AWS Lambda for scalable processing, and PyMuPDF (fitz) for high-fidelity extraction.

## Key Features

- **Direct S3 Uploads**: Uses pre-signed URLs to handle large files (up to 50MB) and bulk uploads efficiently.
- **High-Fidelity Extraction**: Accurate text extraction preserving document structure using PyMuPDF.
- **Bulk Processing**: Upload multiple PDFs simultaneously with individual progress tracking.
- **Searchable Results**: View extracted text with built-in search and pagination.
- **Serverless Architecture**: Built with AWS Lambda, S3, and API Gateway for zero-management scaling.

## Architecture

- **Frontend**: Next.js (TypeScript, Tailwind CSS)
- **Backend**: FastAPI (Python) running on AWS Lambda via Mangum
- **Extraction**: PyMuPDF (fitz)
- **Infrastructure**: AWS (S3, Lambda, API Gateway) provisioned via Terraform

---

## Getting Started

### Prerequisites

- **Python 3.9+**
- **Node.js 18+**
- **Terraform**
- **AWS CLI** (configured with credentials)
- **Docker** (required for building the Lambda Layer)

### 1. Infrastructure Deployment

Deploy the AWS resources using Terraform:

```bash
cd infra
terraform init
terraform apply
```

Note: After deployment, take note of the `api_endpoint` and `s3_bucket_name` from the Terraform outputs.

### 2. Backend Setup

The backend is a FastAPI application. To run it locally for development:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
export S3_BUCKET_NAME=<your-s3-bucket-name>
uvicorn main:app --reload
```

### 3. Frontend Setup

The frontend is a Next.js application:

```bash
cd frontend
npm install
export NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

The application will be available at `http://localhost:3000`.

### 4. Deploying the Backend to Lambda

To bundle the dependencies and deploy to AWS:

1. Build the Lambda layer:
   ```bash
   chmod +x infra/scripts/build_lambda_layer.sh
   ./infra/scripts/build_lambda_layer.sh
   ```
2. Re-run Terraform apply to upload the new code and layer:
   ```bash
   cd infra
   terraform apply
   ```

## Development

### Testing

Run backend tests using pytest:

```bash
cd backend
PYTHONPATH=.. pytest ../tests/backend
```

## Security

- **IAM Roles**: Lambda execution role follows the principle of least privilege.
- **Pre-signed URLs**: Enforces 50MB file size limits and PDF-only content types.
- **Public Access**: S3 bucket has public access blocked; all access is via IAM or pre-signed URLs.

## License

MIT
