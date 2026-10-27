output "instance_id" {
  description = "ID da instância EC2"
  value       = aws_instance.api.id
}

output "public_ip" {
  description = "IP público da instância"
  value       = aws_instance.api.public_ip
}

output "api_url" {
  description = "URL base da API"
  value       = "http://${aws_instance.api.public_ip}:3000"
}
