# PDF Text Extractor - Technical Details

## Tech Stack
- **Frontend**: Next.js (TypeScript) with Tailwind CSS for a modern, responsive UI.
- **Backend**: FastAPI (Python) for high-performance PDF processing.
- **PDF Processing**: `PyMuPDF` (fitz) for fast text and metadata extraction.
- **OCR Integration**: AWS Textract for high-accuracy OCR on scanned documents.

## AWS Cloud Infrastructure (via Terraform)
The infrastructure is provisioned using Terraform for consistency and scalability.

### Core Components
- **Amazon S3**: For storing uploaded PDF files and extracted output.
- **AWS Lambda**: For serverless, scalable PDF processing triggered by S3 events.
- **Amazon DynamoDB**: For storing document metadata and processing status.
- **Amazon API Gateway**: To expose secure backend endpoints to the frontend.
- **AWS IAM**: For fine-grained access control across resources.

## Monitoring, Logging, and Observability
- **Amazon CloudWatch Logs**: Centralized logging for Lambda functions and API Gateway.
- **Amazon CloudWatch Metrics**: Real-time monitoring of processing times, success rates, and errors.
- **AWS X-Ray**: Distributed tracing to identify bottlenecks in the extraction pipeline.
- **CloudWatch Alarms**: Automated notifications for system failures or performance issues.

## Deployment Pipeline
- Infrastructure as Code (IaC) with Terraform.
- Automated CI/CD for backend and frontend components.
- Version-controlled infrastructure and application code.`