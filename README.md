# ✍️ ple.ad writer

> **Agente inteligente para la edición profesional de documentos con IA**

Un editor de documentos moderno y minimalista que combina una interfaz limpia con capacidades de asistencia inteligente para la escritura profesional.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-black)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 🌟 Características Principales

### 📝 Editor Inteligente
- **Editor Markdown simplificado** con toolbar intuitivo
- **Auto-guardado** en tiempo real en localStorage
- **Gestión de documentos** con sidebar organizador
- **Estadísticas en vivo** (palabras, caracteres, tiempo de lectura)
- **Exportación a DOCX** con formato profesional

### 🤖 Asistente de IA Integrado
- **Chat inteligente** para asistencia de escritura
- **Interfaz limpia** con diseño estilo Cursor/VS Code
- **Respuestas contextuales** para mejoras de texto
- **Sugerencias de estilo** y corrección gramatical

### 🎨 Diseño Moderno
- **UI minimalista** inspirada en editores profesionales
- **Responsive design** optimizado para todos los dispositivos
- **Modo oscuro** y colores suaves para reducir fatiga visual
- **Animaciones sutiles** y transiciones fluidas

## 🚀 Demo en Vivo

```bash
# Instalación rápida
git clone https://github.com/tu-usuario/plead-writer
cd plead-writer
npm install
npm run dev
```

Visita [http://localhost:3001](http://localhost:3001) para ver la aplicación.

## 📦 Instalación

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/plead-writer
cd plead-writer

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Con Docker

```bash
# Ejecutar con Docker Compose
docker compose up --build
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🛠️ Stack Tecnológico

| Tecnología | Uso | Versión |
|------------|-----|---------|
| **Next.js** | Framework React full-stack | 15.3.3 |
| **React** | Biblioteca de interfaz de usuario | 18.3.1 |
| **TypeScript** | Tipado estático | 5.x |
| **CSS Variables** | Sistema de diseño personalizado | - |
| **docx** | Generación de documentos Word | 8.5.0 |
| **file-saver** | Descarga de archivos | 2.0.5 |

## 📁 Estructura del Proyecto

```
ple.ad-writer/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 🎨 globals.css              # Estilos principales
│   │   ├── 📱 responsive-improvements.css # Responsive design
│   │   ├── 🏗️ layout.tsx               # Layout principal
│   │   └── 📄 page.tsx                 # Página principal
│   ├── 📁 components/
│   │   ├── ✏️ SimpleEditor.tsx         # Editor de texto
│   │   ├── 💬 ChatInterface.tsx        # Asistente de IA
│   │   └── 📁 DocumentManager.tsx      # Gestor de documentos
│   └── 📁 types/                       # Tipos TypeScript
├── 🐳 docker-compose.yml              # Configuración Docker
├── 📦 package.json                    # Dependencias
└── 📚 README.md                       # Documentación
```

## 🎯 Funcionalidades Detalladas

### Editor de Texto
- ✅ **Formato Markdown**: Negrita, cursiva, encabezados
- ✅ **Listas**: Ordenadas y desordenadas  
- ✅ **Citas y código**: Bloques de cita y código
- ✅ **Toolbar visual**: Botones para formato rápido
- ✅ **Atajos de teclado**: Ctrl+B, Ctrl+I, etc.

### Gestión de Documentos
- ✅ **Auto-guardado**: Persistencia automática
- ✅ **Múltiples documentos**: Organizador lateral
- ✅ **Renombrado rápido**: Click para editar títulos
- ✅ **Estadísticas**: Conteo de palabras en tiempo real

### Exportación
- ✅ **DOCX profesional**: Formato Microsoft Word
- ✅ **Markdown raw**: Código fuente
- ✅ **Copia al portapapeles**: Un click para copiar

### Asistente de IA
- ✅ **Chat contextual**: Ayuda específica por documento
- ✅ **Interfaz moderna**: Diseño limpio y funcional
- ✅ **Respuestas simuladas**: Base para integración real

## 🚧 Roadmap Futuro

### 🔮 Próximas Versiones

#### v0.2.0 - Integración IA Real
- [ ] **API de Gemini**: Asistencia real con IA
- [ ] **Análisis de contenido**: Sugerencias contextuales
- [ ] **Corrección automática**: Gramática y estilo

#### v0.3.0 - Colaboración
- [ ] **Edición colaborativa**: Múltiples usuarios
- [ ] **Comentarios**: Sistema de revisión
- [ ] **Historial de versiones**: Control de cambios

#### v0.4.0 - Funciones Avanzadas
- [ ] **Importación DOCX**: Carga de documentos Word
- [ ] **Plantillas**: Templates predefinidos
- [ ] **Exportación PDF**: Más formatos de salida

## 🔧 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo

# Producción
npm run build        # Construir para producción
npm run start        # Ejecutar versión de producción

# Utilidades
npm run lint         # Linter de código
```

### Variables de Entorno

```env
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME="ple.ad writer"
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Guías de Contribución

- Usar **TypeScript** para todo el código nuevo
- Seguir las **convenciones de nombres** existentes
- Escribir **comentarios descriptivos**
- Mantener **responsive design**

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Reconocimientos

- **Next.js Team** - Framework increíble
- **Vercel** - Plataforma de deployment
- **React Team** - Biblioteca de UI
- **Docx Library** - Generación de documentos

## 📞 Contacto

- **Proyecto**: [ple.ad writer](https://github.com/tu-usuario/plead-writer)
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/plead-writer/issues)
- **Documentación**: [Wiki](https://github.com/tu-usuario/plead-writer/wiki)

---

<div align="center">

**[⬆ Volver arriba](#-plead-writer)**

Hecho con ❤️ para escritores y profesionales que buscan eficiencia

</div> 