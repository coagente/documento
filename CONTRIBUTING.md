# 🤝 Contribuyendo a ple.ad writer

¡Gracias por tu interés en contribuir a ple.ad writer! Este documento te guiará a través del proceso de contribución.

## 📋 Tabla de Contenidos

- [Código de Conducta](#código-de-conducta)
- [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
- [Configuración del Entorno de Desarrollo](#configuración-del-entorno-de-desarrollo)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Guías de Estilo](#guías-de-estilo)
- [Proceso de Pull Request](#proceso-de-pull-request)

## 📜 Código de Conducta

Este proyecto adhiere a un Código de Conducta. Al participar, se espera que respetes este código. Por favor reporta comportamientos inaceptables a los mantenedores del proyecto.

## 🎯 ¿Cómo Puedo Contribuir?

### 🐛 Reportando Bugs

Antes de crear un issue, por favor:

1. **Verifica** que el bug no haya sido reportado ya
2. **Busca** en issues cerrados por si fue resuelto
3. **Incluye** información detallada:
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots si aplica
   - Información del sistema (OS, browser, etc.)

### 💡 Sugiriendo Mejoras

Para sugerir nuevas funcionalidades:

1. **Abre un issue** con la etiqueta "enhancement"
2. **Describe** claramente la funcionalidad
3. **Explica** por qué sería útil
4. **Incluye** mockups o ejemplos si es posible

### 🔧 Contribuyendo con Código

1. **Fork** el repositorio
2. **Crea** una rama para tu feature
3. **Desarrolla** siguiendo las guías de estilo
4. **Prueba** tu código
5. **Submite** un pull request

## 🛠️ Configuración del Entorno de Desarrollo

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Git

### Instalación

```bash
# Clonar tu fork
git clone https://github.com/tu-usuario/plead-writer.git
cd plead-writer

# Agregar el repositorio original como upstream
git remote add upstream https://github.com/usuario-original/plead-writer.git

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

### Estructura de Desarrollo

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globales
│   ├── responsive-improvements.css  # Responsive design
│   ├── layout.tsx         # Layout principal
│   └── page.tsx          # Página principal
├── components/            # Componentes React
│   ├── SimpleEditor.tsx   # Editor de texto
│   ├── ChatInterface.tsx  # Asistente de IA
│   └── DocumentManager.tsx # Gestor de documentos
└── types/                # Tipos TypeScript
```

## 🔄 Proceso de Desarrollo

### 1. Crear una Rama

```bash
# Asegúrate de estar en main y actualizada
git checkout main
git pull upstream main

# Crea una nueva rama
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

### 2. Desarrollo

- **Commitea frecuentemente** con mensajes descriptivos
- **Sigue** las convenciones de código existentes
- **Añade** comentarios JSDoc para funciones complejas
- **Mantén** el responsive design

### 3. Testing

```bash
# Verifica que el proyecto construya
npm run build

# Ejecuta el linter
npm run lint

# Prueba manualmente en diferentes resoluciones
npm run dev
```

## 🎨 Guías de Estilo

### TypeScript

```typescript
// ✅ Bueno
interface DocumentInfo {
  id: string
  title: string
  content: string
  lastModified: Date
}

// ❌ Evitar
interface docInfo {
  id: any
  title: any
}
```

### React Components

```tsx
// ✅ Estructura recomendada
export default function ComponentName({ prop }: Props) {
  // 1. State hooks
  const [state, setState] = useState()
  
  // 2. Effect hooks
  useEffect(() => {
    // logic
  }, [])
  
  // 3. Handler functions
  const handleClick = useCallback(() => {
    // logic
  }, [])
  
  // 4. Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  )
}
```

### CSS

```css
/* ✅ Usar variables CSS */
.component {
  color: var(--text-primary);
  padding: var(--space-4);
  border-radius: var(--radius-md);
}

/* ✅ Nomenclatura BEM para clases específicas */
.chat-input-container {
  /* styles */
}

.chat-input-container--focused {
  /* modifier */
}
```

### Commits

Usa el formato [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agregar exportación a PDF
fix: corregir auto-resize del chat input
docs: actualizar README con nuevas funcionalidades
style: mejorar responsive design en móviles
refactor: simplificar lógica del DocumentManager
test: agregar tests para SimpleEditor
```

## 🔀 Proceso de Pull Request

### Antes de Enviar

1. **Sincroniza** con upstream:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Verifica** que todo funcione:
   ```bash
   npm run build
   npm run lint
   ```

3. **Squash** commits relacionados si es necesario

### Template de PR

```markdown
## 📝 Descripción

Breve descripción de los cambios

## 🎯 Tipo de Cambio

- [ ] Bug fix (cambio que corrige un issue)
- [ ] Nueva funcionalidad (cambio que añade funcionalidad)
- [ ] Cambio que rompe compatibilidad (fix o feature que causaría que funcionalidad existente no funcione)
- [ ] Documentación

## ✅ Checklist

- [ ] Mi código sigue las guías de estilo del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código en áreas difíciles de entender
- [ ] He actualizado la documentación correspondiente
- [ ] Mis cambios no generan nuevos warnings
- [ ] He probado que mis cambios funcionan
- [ ] He verificado responsive design

## 📱 Screenshots (si aplica)

Antes | Después
-------|--------
[img]  | [img]
```

### Revisión

- Un mantenedor revisará tu PR
- Puede solicitar cambios
- Una vez aprobado, será mergeado

## 🆘 ¿Necesitas Ayuda?

- **Issues**: Para bugs y feature requests
- **Discussions**: Para preguntas generales
- **Discord**: [Enlace al server] (si existe)

## 🏷️ Etiquetas de Issues

- `bug` - Algo no funciona
- `enhancement` - Nueva funcionalidad
- `documentation` - Mejoras a documentación
- `good first issue` - Bueno para nuevos contribuidores
- `help wanted` - Se necesita ayuda extra
- `question` - Más información requerida

---

¡Gracias por contribuir a ple.ad writer! 🎉 