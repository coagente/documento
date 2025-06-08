# 🚀 Guía de Despliegue en Producción

> **ple.ad writer v2.0 - Configuración optimizada para producción**

Esta guía te ayudará a desplegar ple.ad writer en un entorno de producción con todas las optimizaciones y medidas de seguridad necesarias.

## 📋 Requisitos del Sistema

### **Hardware Mínimo**
- **CPU**: 2 cores
- **RAM**: 2GB disponible
- **Disco**: 10GB libres
- **Red**: Conexión estable a internet

### **Software**
- **Docker**: 20.10.0+
- **Docker Compose**: 2.0.0+
- **Sistema operativo**: Ubuntu 20.04+, CentOS 8+, o similar

## 🏗️ Arquitectura de Producción

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Internet      │    │     Nginx       │    │   Next.js App   │
│                 │───▶│  Reverse Proxy  │───▶│   (Container)   │
│   Port 80/443   │    │   (Container)   │    │   Port 3000     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Log Monitor   │
                       │   (Container)   │
                       └─────────────────┘
```

## 🚀 Despliegue Rápido

### **1. Preparación del Servidor**

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose-plugin

# Agregar usuario al grupo docker
sudo usermod -aG docker $USER
newgrp docker
```

### **2. Clonar y Configurar**

```bash
# Clonar repositorio
git clone <tu-repositorio>
cd documento

# Crear archivo de configuración
cp .env.example .env.production

# Editar variables de producción
nano .env.production
```

### **3. Variables de Entorno (.env.production)**

```bash
# ================================
# Configuración de Producción
# ================================

# Entorno
NODE_ENV=production

# API Keys
GEMINI_API_KEY=tu_api_key_aqui

# Configuración Next.js
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0

# Configuración opcional
TZ=UTC
LANG=en_US.UTF-8
```

### **4. Iniciar Servicios**

```bash
# Hacer scripts ejecutables
chmod +x *.sh

# Iniciar en producción
./start-production.sh
```

## 📊 Monitoreo y Mantenimiento

### **Scripts Disponibles**

```bash
# Iniciar servicios
./start-production.sh

# Monitorear estado
./monitor-production.sh

# Monitoreo continuo
./monitor-production.sh --watch

# Detener servicios
./stop-production.sh
```

### **Comandos Docker Útiles**

```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f nginx

# Verificar estado de servicios
docker-compose -f docker-compose.prod.yml ps

# Reiniciar un servicio
docker-compose -f docker-compose.prod.yml restart app

# Ver uso de recursos
docker stats
```

## 🏥 Health Checks

### **Endpoints de Monitoreo**

| Endpoint | Descripción | Uso |
|----------|-------------|-----|
| `http://localhost/health` | Health check de nginx | Monitoreo externo |
| `http://localhost/api/health` | Health check detallado | Diagnóstico completo |

### **Ejemplo de Respuesta de Health Check**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "memory": {
    "used": 128,
    "total": 256,
    "external": 32
  },
  "environment": {
    "nodeVersion": "v18.18.0",
    "platform": "linux",
    "arch": "x64",
    "hasGeminiKey": true,
    "nodeEnv": "production",
    "port": 3000
  }
}
```

## 🔧 Configuración Avanzada

### **Límites de Recursos**

Los contenedores están configurados con límites específicos:

- **App Container**: 1 CPU, 1GB RAM
- **Nginx Container**: 0.5 CPU, 256MB RAM
- **Log Monitor**: 0.1 CPU, 32MB RAM

### **Configuración de Red**

```yaml
# Red interna aislada
networks:
  plead-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

### **Volúmenes Persistentes**

```yaml
volumes:
  nginx-logs:      # Logs de nginx
  nginx-cache:     # Cache de nginx
```

## 🔒 Seguridad

### **Medidas Implementadas**

✅ **Contenedores no-root**: Usuario `nextjs` (UID 1001)  
✅ **Headers de seguridad**: X-Frame-Options, CSP, etc.  
✅ **Rate limiting**: 10 req/s para API, 30 req/s general  
✅ **Network isolation**: Red interna aislada  
✅ **Resource limits**: Prevención de agotamiento de recursos  
✅ **Log rotation**: Prevención de llenado de disco  

### **Headers de Seguridad**

```nginx
# Configurados automáticamente
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: [configured]
```

## 📈 Optimizaciones de Rendimiento

### **Nginx**
- **Compresión gzip** para todos los assets
- **Cache de archivos estáticos** (1 año)
- **Keep-alive connections**
- **Worker processes** automáticos

### **Next.js**
- **Build optimizado** para producción
- **Standalone output** (imagen más pequeña)
- **CSS optimization** habilitado
- **Telemetry disabled**

### **Docker**
- **Multi-stage build** (imagen final ~200MB)
- **Layer caching** optimizado
- **Alpine Linux** como base
- **Dependencias de producción** únicamente

## 🚨 Solución de Problemas

### **Problemas Comunes**

#### **"Cannot connect to Docker daemon"**
```bash
# Verificar que Docker esté corriendo
sudo systemctl status docker
sudo systemctl start docker
```

#### **"Port 80 already in use"**
```bash
# Verificar qué está usando el puerto
sudo netstat -tulpn | grep :80
sudo fuser -k 80/tcp  # Matar proceso si es seguro
```

#### **"Health check failing"**
```bash
# Verificar logs de la aplicación
docker-compose -f docker-compose.prod.yml logs app

# Verificar configuración de red
docker network ls
```

#### **"Out of memory"**
```bash
# Verificar uso de memoria
docker stats
free -h

# Reiniciar servicios si es necesario
./stop-production.sh
./start-production.sh
```

### **Logs de Diagnóstico**

```bash
# Logs completos del sistema
docker-compose -f docker-compose.prod.yml logs

# Logs específicos con timestamp
docker-compose -f docker-compose.prod.yml logs -t app

# Seguir logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```

## 🔄 Actualizaciones

### **Actualización del Código**

```bash
# Hacer backup
./stop-production.sh

# Actualizar código
git pull origin main

# Rebuild y restart
docker-compose -f docker-compose.prod.yml build --no-cache
./start-production.sh
```

### **Actualización de Dependencias**

```bash
# Actualizar package.json
npm update

# Rebuild imagen
docker-compose -f docker-compose.prod.yml build --no-cache app
```

## 📊 Métricas y Monitoreo

### **Métricas Clave a Monitorear**

- **Uptime**: Disponibilidad del servicio
- **Response time**: Tiempo de respuesta
- **Memory usage**: Uso de memoria
- **CPU usage**: Uso de CPU
- **Disk space**: Espacio en disco
- **Network I/O**: Tráfico de red

### **Herramientas Recomendadas**

- **Prometheus + Grafana**: Para métricas avanzadas
- **ELK Stack**: Para análisis de logs
- **Uptime Robot**: Para monitoreo externo
- **Netdata**: Para monitoreo en tiempo real

## 🌐 Configuración de Dominio (Opcional)

### **Con SSL/TLS (Recomendado)**

1. **Configurar DNS** apuntando a tu servidor
2. **Instalar Certbot** para SSL automático:

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Auto-renovación
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

3. **Modificar nginx.conf** para HTTPS
4. **Actualizar docker-compose.prod.yml** para puerto 443

## 🎯 Checklist de Producción

### **Antes del Despliegue**
- [ ] Variables de entorno configuradas
- [ ] API keys válidas y seguras
- [ ] Firewall configurado (puertos 80, 443)
- [ ] Monitoring setup funcionando
- [ ] Backups configurados
- [ ] SSL/TLS configurado (si aplicable)

### **Después del Despliegue**
- [ ] Health checks pasando
- [ ] Logs sin errores
- [ ] Performance aceptable
- [ ] Monitoring activo
- [ ] Documentación actualizada

---

<div align="center">

**[⬆ Volver arriba](#-guía-de-despliegue-en-producción)**

🚀 **ple.ad writer v2.0** | Production Ready

Para soporte: consulta los logs y health checks

</div> 