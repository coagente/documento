#!/bin/bash

# ================================
# Script de parada para producción
# ple.ad writer v2.0
# ================================

set -e  # Salir si hay errores

echo "🛑 Parando ple.ad writer en modo producción..."

# Verificar que Docker esté corriendo
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Parar servicios gracefully
echo "⏸️  Parando servicios..."
docker-compose -f docker-compose.prod.yml stop

# Opcional: remover contenedores
read -p "¿Deseas remover los contenedores? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removiendo contenedores..."
    docker-compose -f docker-compose.prod.yml down --remove-orphans
    
    read -p "¿Deseas remover también los volúmenes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "💾 Removiendo volúmenes..."
        docker-compose -f docker-compose.prod.yml down --volumes
    fi
fi

# Opcional: limpiar imágenes no utilizadas
read -p "¿Deseas limpiar imágenes Docker no utilizadas? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 Limpiando imágenes no utilizadas..."
    docker image prune -f
fi

echo "✅ ple.ad writer detenido correctamente" 