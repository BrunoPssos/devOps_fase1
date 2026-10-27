variable "aws_region" {
  description = "Região da AWS onde os recursos serão criados"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "Tipo da instância EC2 (t2.micro/t3.micro entram no free tier)"
  type        = string
  default     = "t2.micro"
}

variable "project_name" {
  description = "Nome usado para identificar os recursos"
  type        = string
  default     = "devops-fase1"
}

variable "ssh_allowed_cidr" {
  description = "CIDR autorizado a acessar a porta 22 (use seu IP, ex.: 200.1.2.3/32)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "key_name" {
  description = "Nome de um key pair já existente na AWS para acesso SSH (opcional)"
  type        = string
  default     = null
}
