#!/bin/bash

# ================================
# Script de inicio para producción
# ple.ad writer v2.0
# ================================

set -e  # Salir si hay errores

echo "🚀 Iniciando ple.ad writer en modo producción..."

# Verificar que Docker esté corriendo
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Verificar que el archivo .env.production existe
if [ ! -f ".env.production" ]; then
    echo "⚠️  Creando .env.production desde .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
    else
        cat > .env.production << EOF
# Variables de entorno para producción
NODE_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here

# Configuración opcional
NEXT_TELEMETRY_DISABLED=1
EOF
    fi
    echo "📝 Por favor, edita .env.production con tus valores reales"
fi

# Limpiar contenedores anteriores si existen
echo "🧹 Limpiando contenedores anteriores..."
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true

# Construir imágenes
echo "🔨 Construyendo imágenes optimizadas..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Iniciar servicios
echo "▶️  Iniciando servicios..."
docker-compose -f docker-compose.prod.yml up -d

# Esperar que los servicios estén listos
echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Verificar estado de los servicios
echo "🔍 Verificando estado de los servicios..."
docker-compose -f docker-compose.prod.yml ps

# Verificar health checks
echo "🏥 Verificando health checks..."
for i in {1..30}; do
    if curl -f http://localhost/health >/dev/null 2>&1; then
        echo "✅ Aplicación lista en http://localhost"
        echo "📊 Health check: http://localhost/api/health"
        echo "📈 Logs: docker-compose -f docker-compose.prod.yml logs -f"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo "❌ Error: La aplicación no respondió en 30 segundos"
        echo "🔍 Revisa los logs: docker-compose -f docker-compose.prod.yml logs"
        exit 1
    fi
    
    echo "   Intento $i/30 - esperando..."
    sleep 1
done

echo ""
echo "🎉 ¡ple.ad writer está corriendo en producción!"
echo "🌐 URL: http://localhost"
echo "📊 Health: http://localhost/health"
echo "📈 Logs: docker-compose -f docker-compose.prod.yml logs -f" 