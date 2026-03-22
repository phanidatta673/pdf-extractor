#!/bin/bash
set -e

# Build script for Lambda Layer containing PyMuPDF and dependencies
# This script uses Docker to ensure compatibility with Lambda's Amazon Linux environment.

LAYER_DIR="lambda_layer"
PYTHON_DIR="${LAYER_DIR}/python"
OUTPUT_FILE="infra/pymupdf_layer.zip"

echo "Building Lambda layer for PyMuPDF..."

# Clean up
rm -rf ${LAYER_DIR}
mkdir -p ${PYTHON_DIR}

# Install dependencies into the layer directory
# Using Amazon Linux image to get the correct binaries for PyMuPDF
docker run --rm -v "$(pwd):/var/task" public.ecr.aws/sam/build-python3.9:latest \
    pip install -t /var/task/${PYTHON_DIR} PyMuPDF mangum fastapi

# Create zip file
echo "Zipping layer..."
cd ${LAYER_DIR}
zip -rq "../../${OUTPUT_FILE}" python/
cd ..

# Clean up
rm -rf ${LAYER_DIR}

echo "Lambda layer built successfully: ${OUTPUT_FILE}"
