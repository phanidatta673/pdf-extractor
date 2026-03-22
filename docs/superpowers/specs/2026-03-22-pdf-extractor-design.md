# PDF Text Extractor - Design Specification (2026-03-22)

## 1. Goal
Build a high-fidelity PDF text extractor with multi-page and bulk upload support, using an agentic paradigm that prioritizes automated infrastructure provisioning and iterative "surgical" code updates.

## 2. Architecture: "The Surgical Serverless Agent"
A simple but production-ready serverless stack optimized for fast feedback loops and minimal maintenance.

### Components
*   **Frontend**: Next.js (TypeScript/Tailwind CSS).
    *   **Upload Strategy**: To bypass AWS API Gateway (10MB) and Lambda (6MB) payload limits, the frontend will use **S3 Pre-signed URLs** to upload PDFs directly to S3.
    *   **Single File Upload**: Fast, asynchronous extraction triggered after S3 upload.
    *   **Multiple File Upload**: Frontend-parallelized; each file is uploaded independently via its own pre-signed URL to avoid bulk payload limits.
*   **Backend**: FastAPI (Python) running on **AWS Lambda** via **Mangum**.
    *   **Library**: `PyMuPDF` (`fitz`) bundled in a Lambda Layer or custom Docker image to handle binary dependencies.
    *   **Endpoint**: 
        *   `GET /upload-url`: Returns a pre-signed S3 URL for a specific file.
        *   `POST /extract`: Accepts an S3 key, processes the file from S3, and returns the result.
*   **Infrastructure**:
    *   **AWS API Gateway**: HTTP API for low-latency routing.
    *   **Amazon S3**: Bucket for raw PDFs and processed JSON results.
    *   **Terraform**: IaC for all resources (S3, IAM, Lambda, API Gateway).

## 3. Data Flow
1.  **Frontend**: Requests a pre-signed URL from the backend.
2.  **S3**: Frontend uploads the PDF directly to S3 using the pre-signed URL.
3.  **Backend**: Frontend calls `/extract` with the S3 key.
4.  **Lambda**:
    *   Reads the PDF from S3.
    *   Parses the PDF using `fitz`.
    *   Extracts text and metadata (title, page count).
    *   **Persistence**: Saves the extracted JSON result back to S3 (e.g., `results/<key>.json`).
    *   Returns the JSON payload to the frontend.
5.  **Frontend**: Renders the text in a paginated, searchable view.

## 4. Agentic Build Strategy
*   **Infrastructure-First**: Use AWS IaC MCP and Terraform to provision the environment *before* implementing business logic.
*   **Surgical Updates**: Use the `replace` tool for targeted backend and frontend edits.
*   **Automated Verification**: Use `pytest` for backend unit tests and a "live" API test script for integration verification.

## 5. Security & Error Handling
*   **IAM**: Least-privilege roles for the Lambda to access S3.
*   **Validation**: 
    *   **File Size Limit**: Hard limit of 50MB per PDF (enforced via Pre-signed URL conditions).
    *   **Content Type**: Restricted to `application/pdf`.
*   **User Feedback**: UI indicators for "Uploading", "Processing", "Success", and "Error" states.
