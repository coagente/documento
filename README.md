# ✍️ ple.ad writer

> **Editor de documentos inteligente con IA integrada - Versión 2.0**  
> **Desarrollado por [coagente](https://coagente.com)**

Un editor de documentos moderno con vista dual (Markdown/Preview) que combina una interfaz elegante con asistencia inteligente de IA para la escritura profesional. Ahora con **sistema de preview de cambios** y **control total** sobre las ediciones de IA.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)
![License](https://img.shields.io/badge/license-MIT-green)
![GitHub](https://img.shields.io/badge/GitHub-coagente%2Fdocumento-blue?logo=github)
![Company](https://img.shields.io/badge/by-coagente.com-orange)

## 🌟 Características Principales

### 📝 **Editor Dual Profesional**
- **Vista dual responsive**: Editor Markdown + Vista previa en tiempo real
- **Números de línea completos**: Numeración inteligente que cubre todo el viewport
- **Editor optimizado**: JetBrains Mono, syntax highlighting, auto-resize
- **Estadísticas en vivo**: Palabras, caracteres, tiempo de lectura
- **Títulos editables**: Click para editar nombres de documentos
- **Scroll sincronizado**: Numeración alineada perfectamente

### 🤖 **Asistente de IA Inteligente (Gemini)**
- **🔍 Sistema de Preview**: Ve los cambios ANTES de aplicarlos
- **✅ Control total**: Aprueba o rechaza cambios con un click
- **📋 Diff visual**: Comparación línea por línea de modificaciones
- **🎨 Input refinado**: Diseño minimalista con botón gris en esquina derecha
- **📊 Contador externo**: Visualización de caracteres en el borde del input
- **🚀 Integración Gemini 2.0**: Análisis contextual avanzado

### 📥 **Exportación Múltiple**
- **DOCX**: Conversión completa Markdown → Microsoft Word
- **Markdown**: Descarga del archivo .md original
- **PDF**: Captura de vista previa → PDF multi-página
- **Nombres automáticos**: Con timestamp para organización

### 🎨 **Diseño UX Premium**
- **Fullscreen optimizado**: Máximo espacio para escritura
- **Responsive profesional**: 4 breakpoints (desktop, tablet, móvil, mini)
- **Interfaz estable**: Input sin movimientos al escribir
- **Animaciones sutiles**: Transiciones fluidas y micro-interacciones

## 🆕 Novedades v2.0

### **🔍 Sistema de Preview de Cambios**
- **Vista previa completa** de modificaciones propuestas por IA
- **Diferencias línea por línea** con colores semánticos
- **Aprobación manual** - ningún cambio se aplica automáticamente
- **Modal elegante** con numeración de líneas y tipos de cambio
- **Control total** sobre qué cambios aceptar

### **📏 Números de Línea Inteligentes**
- **Cobertura completa** del viewport del editor
- **Cálculo adaptativo** basado en contenido y espacio visible
- **Sincronización perfecta** con scroll del editor
- **Responsive**: Adapta tamaño en diferentes dispositivos
- **Tipografía monospace** para alineación perfecta

### **🎨 Input del Asistente Rediseñado**
- **Estabilidad total**: No se mueve al escribir
- **Botón elegante**: Gris claro, circular, esquina inferior derecha
- **Contador flotante**: Visible en el borde exterior superior
- **Texto superior**: Alineación optimizada desde arriba
- **Diseño limpio**: Sin interferencias visuales

## 🚀 Inicio Rápido

### Con Docker (Recomendado)
```bash
# Un solo comando para iniciar
docker compose up --build
```

Visita **[http://localhost:3000](http://localhost:3000)** para usar la aplicación.

### Instalación Local
```bash
# Clonar e instalar
git clone https://github.com/coagente/documento.git
cd documento
npm install

# Configurar variables de entorno (opcional para IA)
echo "GEMINI_API_KEY=tu_api_key_aqui" > .env

# Ejecutar en desarrollo
npm run dev
```

## 👨‍💻 Desarrollo

### **Requisitos del Sistema**
- **Node.js**: 18.17.0 o superior
- **npm**: 9.0.0 o superior  
- **Docker**: 20.10+ (opcional pero recomendado)
- **Git**: Para control de versiones

### **Instalación para Desarrollo**

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/coagente/documento.git
   cd documento
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   # Copiar archivo de ejemplo
   cp .env.example .env
   
   # Editar con tus API keys
   # GEMINI_API_KEY=tu_api_key_aqui (opcional)
   ```

4. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

5. **Abrir en navegador**: [http://localhost:3000](http://localhost:3000)

### **Scripts de Desarrollo**
```bash
npm run dev          # Servidor de desarrollo con hot reload
npm run build        # Build de producción
npm run start        # Servidor de producción local
npm run lint         # Linter ESLint + TypeScript
npm run type-check   # Verificación de tipos TypeScript
```

### **Desarrollo con Docker**
```bash
# Desarrollo con hot reload
docker compose up --build

# Solo rebuild cuando cambien dependencias
docker compose up
```

### **Estructura para Desarrollo**
```
src/
├── app/
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Página wrapper
│   ├── globals.css          # Estilos consolidados (3700+ líneas)
│   └── api/
│       ├── chat/route.ts    # API de Gemini AI
│       └── health/route.ts  # Health check endpoint
├── components/
│   └── FullscreenEditor.tsx # Editor principal
├── context/
│   └── DocumentContext.tsx  # Estado global
└── types/
    └── global.d.ts          # Tipos TypeScript
```

### **Variables de Entorno - Desarrollo**
```bash
# .env (desarrollo)
GEMINI_API_KEY=tu_gemini_api_key_aqui
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=ple.ad writer
```

---

## 🚀 Producción

### **Requisitos del Servidor**
- **CPU**: 2+ cores (mínimo 1 core)
- **RAM**: 2GB+ (mínimo 1GB)
- **Docker**: 20.10+ y Docker Compose v2
- **Almacenamiento**: 10GB+ disponibles
- **Red**: Puerto 80 y 443 abiertos

### **Deployment Rápido**

1. **Preparar servidor**:
   ```bash
   # Clonar repositorio
   git clone https://github.com/coagente/documento.git
   cd documento
   
   # Copiar configuración de producción
   cp env.production.template .env.production
   ```

2. **Configurar variables de entorno**:
   ```bash
   # Editar .env.production con tus valores
   nano .env.production
   
   # Variables críticas:
   # GEMINI_API_KEY=tu_api_key_produccion
   # NODE_ENV=production
   # NEXT_PUBLIC_APP_URL=https://tu-dominio.com
   ```

3. **Desplegar con un comando**:
   ```bash
   # Script automatizado de deployment
   chmod +x start-production.sh
   ./start-production.sh
   ```

### **Docker Compose de Producción**

El sistema incluye una configuración completa de producción con:

- **🐳 Aplicación**: Contenedor optimizado (~200MB)
- **🌐 Nginx**: Reverse proxy con SSL y compresión
- **📊 Monitoreo**: Health checks y métricas
- **🔄 Logs**: Rotación automática y persistencia

```bash
# Comandos de gestión de producción
./start-production.sh    # Iniciar todos los servicios
./stop-production.sh     # Parar servicios (con opciones de limpieza)
./monitor-production.sh  # Monitoreo en tiempo real
```

### **Scripts de Producción**

**Iniciar Producción**:
```bash
./start-production.sh
# - Valida Docker y dependencias
# - Crea archivos de configuración
# - Ejecuta health checks
# - Reporta estado del deployment
```

**Parar Producción**:
```bash
./stop-production.sh
# - Para servicios gracefully
# - Opción de limpiar contenedores
# - Opción de limpiar volúmenes
# - Limpieza de imágenes no utilizadas
```

**Monitoreo**:
```bash
./monitor-production.sh
# - Estado de servicios en tiempo real
# - Métricas de recursos (CPU, RAM, disco)
# - Health checks de endpoints
# - Logs recientes
# - Modo watch continuo
```

### **Arquitectura de Producción**

```
Internet → Nginx (Port 80/443) → Next.js App (Port 3000)
    ↓
Log Rotation Service → Persistent Volumes
    ↓
Health Monitoring → /api/health endpoint
```

### **Características de Producción**

- **🔒 Seguridad**: Contenedores non-root, network isolation
- **⚡ Performance**: Gzip, caching, resource limits
- **📈 Escalabilidad**: 1000+ usuarios concurrentes
- **🔍 Monitoreo**: Health checks cada 30s
- **📱 Alta Disponibilidad**: Auto-restart, graceful shutdowns
- **🗂️ Logs**: Rotación automática, 100MB por archivo

### **Variables de Entorno - Producción**
```bash
# .env.production (ejemplo)
NODE_ENV=production
GEMINI_API_KEY=tu_gemini_api_key_produccion
NEXT_PUBLIC_APP_NAME=ple.ad writer
NEXT_PUBLIC_APP_URL=https://tu-dominio.com

# Configuración de recursos
DOCKER_CPU_LIMIT=1
DOCKER_MEMORY_LIMIT=1g
NGINX_CPU_LIMIT=0.5
NGINX_MEMORY_LIMIT=256m
```

### **Troubleshooting de Producción**

**Verificar estado**:
```bash
./monitor-production.sh
docker compose -f docker-compose.prod.yml ps
```

**Ver logs específicos**:
```bash
docker compose -f docker-compose.prod.yml logs app
docker compose -f docker-compose.prod.yml logs nginx
```

**Restart de servicio específico**:
```bash
docker compose -f docker-compose.prod.yml restart app
docker compose -f docker-compose.prod.yml restart nginx
```

### **Documentación Detallada**

Para información completa sobre deployment de producción, consulta:
- 📘 **[PRODUCTION.md](PRODUCTION.md)** - Guía completa de producción
- 📋 **[DEPLOY-SUMMARY.md](DEPLOY-SUMMARY.md)** - Resumen ejecutivo

---

### 🔐 Configuración de IA (Opcional)

Para habilitar la funcionalidad de IA con preview:

1. **Obtener API Key de Gemini**:
   - Visita [Google AI Studio](https://aistudio.google.com)
   - Crea un proyecto y genera una API key
   - Es gratuito con límites generosos

2. **Configurar variable de entorno**:
   ```bash
   # Desarrollo
   echo "GEMINI_API_KEY=tu_api_key_aqui" > .env
   
   # Producción
   echo "GEMINI_API_KEY=tu_api_key_aqui" >> .env.production
   ```

3. **Reiniciar la aplicación**:
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   ./start-production.sh
   ```

> **Nota**: La aplicación funciona completamente sin IA, solo no tendrás la funcionalidad de chat inteligente.

## 🏗️ Arquitectura

### **Componentes Principales**
```
src/
├── app/
│   ├── layout.tsx           # Layout principal con header
│   ├── page.tsx             # Página principal (wrapper)
│   ├── globals.css          # Estilos consolidados (3700+ líneas)
│   └── api/chat/route.ts    # API de Gemini AI
├── components/
│   └── FullscreenEditor.tsx # Editor principal con preview system
├── context/
│   └── DocumentContext.tsx  # Estado global del documento
└── types/
    └── global.d.ts          # Tipos TypeScript
```

### **Flujo de Datos con Preview**
```
DocumentContext → FullscreenEditor → [Editor, Preview, Chat, Export]
                                  ↓
                     API Gemini → Preview Modal → Aprobación Manual
                                                       ↓
                                              Aplicación de Cambios
```

## 🎯 Funcionalidades Detalladas

### **1. Editor Dual Profesional**
- ✅ **Números de línea inteligentes**: Cobertura completa adaptativa
- ✅ **Auto-resize**: Textarea que crece con contenido
- ✅ **Syntax highlighting**: Markdown con JetBrains Mono
- ✅ **Toggle vista dual**: Solo editor o vista completa
- ✅ **Estadísticas**: Tiempo real con precisión
- ✅ **Scroll sincronizado**: Numeración perfectamente alineada

### **2. Sistema de Preview de IA**
- ✅ **Análisis diferencial**: Comparación línea por línea
- ✅ **Modal elegante**: Diseño profesional con scroll
- ✅ **Tipos de cambio**: Agregado (verde), Eliminado (rojo), Modificado (amarillo)
- ✅ **Numeración**: Referencias exactas de líneas modificadas
- ✅ **Aprobación/Rechazo**: Control total con un click
- ✅ **Estados visuales**: Feedback claro del proceso

### **3. Input del Asistente Optimizado**
- ✅ **Estabilidad**: Sin movimientos al escribir o enfocar
- ✅ **Botón refinado**: Gris claro, circular, 32px
- ✅ **Posición esquina**: Inferior derecha, no interfiere
- ✅ **Contador externo**: Círculo flotante en borde superior
- ✅ **Texto arriba**: Alineación superior optimizada
- ✅ **Responsive**: Adaptación a todos los dispositivos

### **4. Exportación Avanzada**
- **DOCX**: Conversión completa con formato preservado
- **MD**: Descarga directa del Markdown editado
- **PDF**: html2canvas → jsPDF multi-página
- **Nombres inteligentes**: `Documento_2024-01-15.extension`

## 🔧 Stack Tecnológico

| Tecnología | Uso | Versión |
|------------|-----|---------|
| **Next.js** | Framework React full-stack | 15.3.3 |
| **React** | Biblioteca UI con hooks avanzados | 18.3.1 |
| **TypeScript** | Tipado estático robusto | 5.x |
| **@google/genai** | Integración Gemini AI | 0.21.0 |
| **react-markdown** | Renderizado Markdown | 9.x |
| **docx** | Generación documentos Word | 8.5.0 |
| **jsPDF + html2canvas** | Generación PDF | Latest |
| **file-saver** | Descarga de archivos | 2.0.5 |

## 📱 Responsive Design Profesional

### **Desktop (1024px+)**
- Vista dual completa con números de línea
- Chat 25vh con input 100px altura
- Botón 32px, contador 28px exterior
- Todos los elementos con texto

### **Tablet (768-1024px)**
- Layout dual optimizado
- Chat 30vh, input 80px
- Botón 30px, contador 26px
- Iconos con espaciado balanceado

### **Mobile (640-768px)**
- Layout stack vertical inteligente
- Chat 35vh, input 70px 
- Botón 28px, contador 24px
- Adaptación completa funcional

### **Mini (<640px)**
- Diseño ultra-compacto
- Chat optimizado, input 60px
- Botón 26px, contador 22px
- Todas las funciones preservadas

## ⚡ Flujos de Usuario

### **🖋️ Flujo de Escritura Mejorado**
1. **Abrir aplicación** → Documento de bienvenida con números de línea
2. **Click en título** → Editar nombre del documento inline
3. **Escribir en editor** → Vista previa + números se actualizan en tiempo real
4. **Ver estadísticas** → Contador de palabras, caracteres, tiempo de lectura

### **🔍 Flujo de IA con Preview**
1. **Escribir solicitud** en chat inferior estable
2. **Presionar Enter** → Procesamiento con spinner
3. **IA analiza** documento + genera cambios propuestos
4. **Modal de preview** → Ver diferencias línea por línea
5. **Aprobar/Rechazar** → Control total sobre cambios
6. **Aplicación** → Solo si se aprueba manualmente

### **📥 Flujo de Exportación**
1. **Contenido en Markdown** con números de línea
2. **Elegir formato**: DOCX (azul), MD (verde), PDF (rojo)
3. **Click botón** → Procesamiento automático
4. **Descarga** → Archivo con nombre y timestamp

## 🛠️ Desarrollo

### **Scripts NPM**
```bash
npm run dev          # Desarrollo local con hot reload
npm run build        # Build de producción optimizado
npm run start        # Servidor de producción
npm run lint         # Linter de código TypeScript
```

### **Características Técnicas**
- **ResizeObserver**: Para números de línea adaptativos
- **Diff Algorithm**: Comparación inteligente de contenido
- **State Management**: React Context optimizado
- **CSS Modern**: 3700+ líneas con responsive profesional
- **Type Safety**: TypeScript estricto en todo el código

## 🎯 Casos de Uso Expandidos

### **👨‍💼 Profesionales**
- **Informes técnicos** con preview de correcciones IA
- **Documentación** con numeración de líneas para referencias
- **Propuestas comerciales** con control de cambios
- **Manuales** con exportación multi-formato

### **✍️ Escritores**
- **Borradores** con asistencia IA controlada
- **Revisión de estilo** línea por línea
- **Estructuración** con preview de reorganización
- **Exportación** a múltiples formatos profesionales

### **🎓 Estudiantes**
- **Ensayos académicos** con referencias numeradas
- **Notas de estudio** organizadas por líneas
- **Trabajos de investigación** con control de cambios
- **Colaboración** con historial visible

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Este proyecto es de código abierto y está desarrollado por **[coagente](https://coagente.com)**.

### **Áreas de contribución:**
- **Frontend**: React/TypeScript/CSS
- **IA Integration**: Gemini AI optimization
- **Export Features**: Nuevos formatos
- **UX/UI**: Mejoras de interfaz
- **Performance**: Optimizaciones
- **Testing**: Unit/Integration tests

### **Cómo contribuir:**
1. **Fork** del [repositorio](https://github.com/coagente/documento)
2. **Crear rama**: `git checkout -b feature/NuevaFuncionalidad`
3. **Desarrollar** siguiendo las convenciones existentes
4. **Testing**: Verificar en múltiples dispositivos
5. **Pull Request** con descripción detallada

### **¿Necesitas ayuda?**
- 📧 **Email**: [info@coagente.com](mailto:info@coagente.com)
- 🌐 **Website**: [coagente.com](https://coagente.com)
- 🐙 **Issues**: [GitHub Issues](https://github.com/coagente/documento/issues)

## 🚧 Roadmap

### **✅ Versión Actual (2.0.0)**
- [x] **Sistema de preview** de cambios IA
- [x] **Números de línea** inteligentes y adaptativos
- [x] **Input optimizado** con contador exterior
- [x] **Responsive profesional** con 4 breakpoints
- [x] **Control total** sobre ediciones IA
- [x] **Estabilidad UX** sin movimientos inesperados

### **🔮 Versión 2.1.0 - Mejoras UX**
- [ ] **Dark mode** toggle con persistencia
- [ ] **Múltiples documentos** con tabs
- [ ] **Historial de cambios** visual con timeline
- [ ] **Atajos de teclado** para power users
- [ ] **Plantillas** predefinidas para diferentes tipos de documento

### **🔮 Versión 2.2.0 - Colaboración**
- [ ] **Edición colaborativa** en tiempo real
- [ ] **Comentarios en línea** con threading
- [ ] **Control de versiones** git-like
- [ ] **Compartir documentos** con permisos

### **🔮 Versión 2.3.0 - IA Avanzada**
- [ ] **Múltiples modelos** IA (GPT, Claude, Gemini)
- [ ] **Prompts personalizados** para estilos específicos
- [ ] **Sugerencias automáticas** mientras escribes
- [ ] **Análisis de tono** y audiencia objetivo

## 📊 Métricas de Rendimiento

### **Optimizaciones Implementadas**
- **Bundle size**: Optimizado con tree-shaking
- **First Paint**: <200ms en desarrollo
- **Interactive**: <500ms tiempo de respuesta
- **Responsive**: 4 breakpoints fluidos
- **Memory**: Gestión eficiente de estado

### **Compatibilidad**
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS Safari 14+, Android Chrome 90+
- **Devices**: Desde 320px hasta 4K
- **Performance**: 60fps en animaciones

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para detalles completos.

---

<div align="center">

**[⬆ Volver arriba](#-plead-writer)**

✨ **Hecho con ❤️ para escritores que buscan control y elegancia** ✨

**v2.0.0** | Preview de Cambios + Números de Línea + UX Optimizada

**🚀 Inicio inmediato**: `docker compose up --build` → http://localhost:3000

**🔍 Control total**: Ve, revisa y aprueba cada cambio de IA

---

### 🏢 Desarrollado por coagente

**[coagente.com](https://coagente.com)** - Soluciones inteligentes con IA

📧 **Contacto**: [info@coagente.com](mailto:info@coagente.com)  
🐙 **GitHub**: [github.com/coagente](https://github.com/coagente)  
🌐 **Repositorio**: [github.com/coagente/documento](https://github.com/coagente/documento)

</div> 