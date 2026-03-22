resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket" "pdf_storage" {
  bucket = "pdf-extractor-storage-${random_id.bucket_suffix.hex}"

  force_destroy = true # Allow for easier cleanup in prototype phase
}

resource "aws_s3_bucket_public_access_block" "pdf_storage_public_access" {
  bucket = aws_s3_bucket.pdf_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "pdf_storage_cors" {
  bucket = aws_s3_bucket.pdf_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["*"] # Adjust to specific frontend domain later if needed
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

output "s3_bucket_name" {
  value = aws_s3_bucket.pdf_storage.id
}
