# HTTP API Gateway for PDF Extractor
resource "aws_apigatewayv2_api" "pdf_api" {
  name          = "pdf-extractor-http-api"
  protocol_type = "HTTP"
  
  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "POST", "OPTIONS", "PUT", "DELETE"]
    allow_headers = ["Content-Type", "Authorization"]
    max_age       = 300
  }
}

# Default stage that auto-deploys changes
resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.pdf_api.id
  name        = "$default"
  auto_deploy = true
}

# Lambda Integration
resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id           = aws_apigatewayv2_api.pdf_api.id
  integration_type = "AWS_PROXY"

  description          = "FastAPI Lambda integration"
  integration_method   = "POST"
  integration_uri      = aws_lambda_function.pdf_extractor.invoke_arn
  payload_format_version = "2.0"
}

# Proxy route to capture all paths
resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.pdf_api.id
  route_key = "ANY /{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Root route
resource "aws_apigatewayv2_route" "root_route" {
  api_id    = aws_apigatewayv2_api.pdf_api.id
  route_key = "ANY /"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

# Output the API endpoint URL
output "api_endpoint" {
  value = aws_apigatewayv2_api.pdf_api.api_endpoint
}
