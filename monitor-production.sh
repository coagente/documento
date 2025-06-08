#!/bin/bash

# ================================
# Script de monitoreo para producción
# ple.ad writer v2.0
# ================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar header
show_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  ple.ad writer - Monitor v2.0  ${NC}"
    echo -e "${BLUE}================================${NC}"
    echo
}

# Función para verificar estado de servicios
check_services() {
    echo -e "${YELLOW}📊 Estado de los servicios:${NC}"
    echo
    docker-compose -f docker-compose.prod.yml ps
    echo
}

# Función para verificar health checks
check_health() {
    echo -e "${YELLOW}🏥 Health Checks:${NC}"
    echo
    
    # Health check de nginx
    if curl -s http://localhost/health >/dev/null; then
        echo -e "  Nginx: ${GREEN}✅ Healthy${NC}"
    else
        echo -e "  Nginx: ${RED}❌ Unhealthy${NC}"
    fi
    
    # Health check de la app
    if curl -s http://localhost/api/health >/dev/null; then
        echo -e "  App:   ${GREEN}✅ Healthy${NC}"
        
        # Mostrar detalles del health check
        echo
        echo -e "${YELLOW}📋 Detalles de la aplicación:${NC}"
        curl -s http://localhost/api/health | jq . 2>/dev/null || curl -s http://localhost/api/health
    else
        echo -e "  App:   ${RED}❌ Unhealthy${NC}"
    fi
    echo
}

# Función para mostrar uso de recursos
show_resources() {
    echo -e "${YELLOW}💻 Uso de recursos:${NC}"
    echo
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}" \
        $(docker-compose -f docker-compose.prod.yml ps -q)
    echo
}

# Función para mostrar logs recientes
show_recent_logs() {
    echo -e "${YELLOW}📝 Logs recientes (últimas 10 líneas):${NC}"
    echo
    echo -e "${BLUE}--- App logs ---${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=5 app
    echo
    echo -e "${BLUE}--- Nginx logs ---${NC}"
    docker-compose -f docker-compose.prod.yml logs --tail=5 nginx
    echo
}

# Función para mostrar información de red
show_network_info() {
    echo -e "${YELLOW}🌐 Información de red:${NC}"
    echo
    docker network ls | grep plead
    echo
    docker network inspect $(docker-compose -f docker-compose.prod.yml ps -q | head -1 | xargs docker inspect --format='{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}') 2>/dev/null | jq '.[0].IPAM.Config' 2>/dev/null || echo "Red interna configurada"
    echo
}

# Función para mostrar información de volúmenes
show_volumes_info() {
    echo -e "${YELLOW}💾 Información de volúmenes:${NC}"
    echo
    docker volume ls | grep plead
    echo
}

# Función principal
main() {
    # Verificar que Docker esté corriendo
    if ! docker info >/dev/null 2>&1; then
        echo -e "${RED}❌ Error: Docker no está corriendo${NC}"
        exit 1
    fi
    
    # Verificar que los servicios estén corriendo
    if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
        echo -e "${RED}❌ Error: Los servicios no están corriendo${NC}"
        echo "   Ejecuta: ./start-production.sh"
        exit 1
    fi
    
    # Modo interactivo o una sola vez
    if [ "$1" = "--watch" ] || [ "$1" = "-w" ]; then
        echo "Modo watch activado. Presiona Ctrl+C para salir."
        while true; do
            clear
            show_header
            check_services
            check_health
            show_resources
            echo -e "${BLUE}Actualizando en 30 segundos...${NC}"
            sleep 30
        done
    else
        show_header
        check_services
        check_health
        show_resources
        show_recent_logs
        show_network_info
        show_volumes_info
        
        echo -e "${GREEN}✅ Monitoreo completado${NC}"
        echo -e "${BLUE}💡 Tip: Usa './monitor-production.sh --watch' para monitoreo continuo${NC}"
    fi
}

# Ejecutar función principal
main "$@" 