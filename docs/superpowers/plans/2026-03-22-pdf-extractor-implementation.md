# PDF Text Extractor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a serverless PDF text extractor using FastAPI, Next.js, and AWS S3/Lambda.

**Architecture:** Frontend uses S3 Pre-signed URLs for direct PDF uploads to bypass API Gateway limits. A FastAPI backend running on Lambda processes PDFs from S3 using PyMuPDF and stores results back in S3.

**Tech Stack:** Next.js, FastAPI, Mangum, PyMuPDF, Terraform, AWS (S3, Lambda, API Gateway).

---

### Task 1: Infrastructure Setup (S3 & IAM)

**Files:**
- Create: `infra/main.tf`
- Create: `infra/s3.tf`
- Create: `infra/iam.tf`

- [ ] **Step 1: Create S3 bucket for PDFs and results**
- [ ] **Step 2: Define IAM role for Lambda with S3 access**
- [ ] **Step 3: Run `terraform init` and `terraform plan`**
- [ ] **Step 4: Apply Terraform to create resources**
- [ ] **Step 5: Commit**

### Task 2: Backend - Pre-signed URL Endpoint

**Files:**
- Create: `backend/main.py`
- Create: `backend/api/upload.py`
- Test: `tests/backend/test_upload.py`

- [ ] **Step 1: Write failing test for `GET /upload-url`**
- [ ] **Step 2: Implement pre-signed URL generation logic using `boto3`**
- [ ] **Step 3: Verify test passes**
- [ ] **Step 4: Commit**

### Task 3: Backend - Extraction Logic

**Files:**
- Create: `backend/services/extractor.py`
- Create: `backend/api/extract.py`
- Test: `tests/backend/test_extractor.py`

- [ ] **Step 1: Write failing test for PDF text extraction**
- [ ] **Step 2: Implement extraction logic using `PyMuPDF` (`fitz`)**
- [ ] **Step 3: Implement persistence: Save extraction JSON result to S3**
- [ ] **Step 4: Implement `POST /extract` endpoint to process S3 keys**
- [ ] **Step 5: Verify tests pass**
- [ ] **Step 6: Commit**

### Task 4: Infrastructure - Lambda & API Gateway

**Files:**
- Modify: `infra/lambda.tf`
- Modify: `infra/api_gateway.tf`
- Create: `infra/scripts/build_lambda_layer.sh`

- [ ] **Step 1: Create script to bundle `PyMuPDF` and dependencies into a Lambda Layer**
- [ ] **Step 2: Define Lambda function with Mangum adapter and the new Layer**
- [ ] **Step 3: Define HTTP API Gateway and routes**
- [ ] **Step 4: Deploy infrastructure changes via Terraform**
- [ ] **Step 5: Commit**

### Task 5: Frontend - Upload Component

**Files:**
- Create: `frontend/components/UploadZone.tsx`
- Create: `frontend/lib/api.ts`

- [ ] **Step 1: Implement S3 direct upload using pre-signed URLs**
- [ ] **Step 2: Implement bulk upload: Use `Promise.all` or sequential uploads for multiple files**
- [ ] **Step 3: Build drag-and-drop UI with per-file progress indicators**
- [ ] **Step 4: Connect UI to backend `/extract` endpoint**
- [ ] **Step 5: Commit**

### Task 6: Frontend - Results View

**Files:**
- Create: `frontend/components/ResultsDisplay.tsx`
- Modify: `frontend/app/page.tsx`

- [ ] **Step 1: Build paginated text display component**
- [ ] **Step 2: Implement search/highlighting within extracted text**
- [ ] **Step 3: Final integration test of the full flow**
- [ ] **Step 4: Commit**
