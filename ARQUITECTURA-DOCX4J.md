# 🏗️ Arquitectura Híbrida: Lexical → docx4j

## 📋 Resumen de la Evolución

**Stack Anterior:** Lexical → docx.js (cliente) → DOCX
**Stack Nuevo:** Lexical → HTML → Java + docx4j (servidor) → DOCX

### ✅ Beneficios de la Nueva Arquitectura
- 🚀 **Calidad profesional** - docx4j produce DOCX idénticos a Microsoft Word
- 📊 **Mejor rendimiento** - Procesamiento en servidor optimizado
- 🎯 **Más funcionalidades** - Soporte completo de WordprocessingML
- 🔧 **Escalabilidad** - Backend independiente y configurable
- 📝 **Ediciones incrementales** - Posibles con WebSockets + XPath
- 🤖 **AI-ready** - Backend puede integrar LLMs para edición automática

---

## 🎯 Arquitectura de Alto Nivel

```
┌─────────────────┐  ①  Edición WYSIWYG
│  React +        │  Lexical AST
│  Lexical        │─────────┐
└─────────────────┘         │
        ▲                   │
        │ HTML (<15 KB)     ▼
┌─────────────────┐  ②  REST/WS
│  API Gateway    │─────────►  Java 21 / Spring Boot 3
└─────────────────┘         ③  docx4j-ImportXHTML
                            │  genera/parchea
                            ▼  WordprocessingML
                       ┌─────────────────┐
                       │ .docx final     │ ④  S3/R2 + versión
                       └─────────────────┘
```

### 🔄 Flujo de Datos
1. **Frontend (Lexical)** → Genera HTML limpio usando `@lexical/html`
2. **HTTP POST** → Envía HTML al microservicio Java  
3. **Backend (docx4j)** → Convierte HTML a WordprocessingML
4. **Respuesta DOCX** → Descarga automática en el navegador

---

## 🚀 Implementación Frontend

### 📦 Dependencias Agregadas
```json
{
  "dependencies": {
    "@lexical/html": "^0.15.0",
    "file-saver": "^2.0.5"
  }
}
```

### 🔧 Funciones Clave

#### 1. Exportar HTML Limpio
```typescript
import { $generateHtmlFromNodes } from '@lexical/html'

function exportAsHtml(editorState: any): string {
  let htmlString = ''
  
  editorState.read(() => {
    const root = $getRoot()
    const children = root.getChildren()
    htmlString = $generateHtmlFromNodes(children, null)
    htmlString = cleanHtmlForDocx4j(htmlString)
  })
  
  return htmlString
}
```

#### 2. Preparar HTML para docx4j
```typescript
function cleanHtmlForDocx4j(html: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Calibri', sans-serif; font-size: 11pt; }
    h1 { font-size: 18pt; font-weight: bold; color: #1f4e79; }
    h2 { font-size: 14pt; font-weight: bold; color: #2e75b6; }
    /* ... más estilos CSS ... */
  </style>
</head>
<body>${html}</body>
</html>`
}
```

#### 3. Enviar al Backend
```typescript
async function exportViaBackend(html: string, filename: string) {
  const response = await fetch('http://localhost:8080/api/docx/convert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      html: html,
      filename: filename,
      metadata: {
        title: 'Documento',
        creator: 'Docs Editor'
      }
    })
  })
  
  const blob = await response.blob()
  saveAs(blob, filename)
}
```

---

## ⚙️ Implementación Backend

### 📁 Estructura del Proyecto
```
backend-java-example/
├── pom.xml                    # Maven dependencies
├── DocxController.java        # REST controller
└── src/main/resources/
    └── application.yml        # Spring Boot config
```

### 🛠️ Dependencias Maven (pom.xml)
```xml
<dependencies>
  <!-- Spring Boot -->
  <dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
  </dependency>
  
  <!-- docx4j Core -->
  <dependency>
    <groupId>org.docx4j</groupId>
    <artifactId>docx4j-JAXB-ReferenceImpl</artifactId>
    <version>11.5.2</version>
  </dependency>
  
  <!-- ImportXHTML -->
  <dependency>
    <groupId>org.docx4j</groupId>
    <artifactId>docx4j-ImportXHTML</artifactId>
    <version>11.5.0</version>
  </dependency>
</dependencies>
```

### 🎯 Endpoint Principal
```java
@PostMapping("/convert")
public ResponseEntity<byte[]> htmlToDocx(@RequestBody HtmlToDocxRequest request) {
    // 1. Crear WordprocessingMLPackage
    WordprocessingMLPackage wordPackage = WordprocessingMLPackage.createPackage();
    
    // 2. Configurar ImportXHTML
    XHTMLImporterImpl importer = new XHTMLImporterImpl(wordPackage);
    importer.setTableFormatting(FormattingOption.OUTPUT_CALC_TBL_LAYOUTS);
    
    // 3. Convertir HTML → WordML
    wordPackage.getMainDocumentPart()
        .getContent()
        .addAll(importer.convert(request.getHtml(), null));
    
    // 4. Exportar como bytes
    ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
    wordPackage.save(outputStream);
    
    return ResponseEntity.ok()
        .header("Content-Disposition", "attachment; filename=" + request.getFilename())
        .body(outputStream.toByteArray());
}
```

---

## 🎛️ Nuevos Controles de Usuario

### 🔘 Botones Agregados al Toolbar

| Botón | Función | Color |
|-------|---------|-------|
| `☁️ DOCX` | Exportar vía backend Java + docx4j | Verde |
| `📄 Local` | Exportar local (fallback) | Azul |
| `🔗 HTML` | Ver HTML limpio para docx4j | Naranja |
| `🧠 MD` | Ver Markdown (existente) | Gris oscuro |

### 🎨 Estados Visuales
- **Verde** = Backend conectado y funcionando
- **Azul** = Fallback local (sin backend)
- **Naranja** = Vista de código HTML
- **Activo** = Cuando el botón está presionado

---

## 🚀 Instrucciones de Despliegue

### 📱 Frontend (Actual)
```bash
# Ya funcionando
docker compose up --build
# → http://localhost:3000
```

### ☁️ Backend Java (Nuevo)
```bash
# 1. Crear proyecto Spring Boot
mkdir backend-java && cd backend-java
mvn archetype:generate \
  -DgroupId=com.docseditor \
  -DartifactId=docx-backend \
  -DarchetypeArtifactId=maven-archetype-quickstart

# 2. Copiar archivos del ejemplo
cp backend-java-example/* src/main/java/

# 3. Ejecutar
mvn spring-boot:run
# → http://localhost:8080
```

### 🐳 Docker Completo (Frontend + Backend)
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_BACKEND_URL=http://backend:8080
    depends_on:
      - backend
      
  backend:
    build: ./backend-java
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
```

---

## 🧪 Testing de la Funcionalidad

### ✅ Checklist de Pruebas

1. **🎨 Crear contenido rico en el editor:**
   - Títulos H1, H2, H3
   - Párrafos con formato (negrita, cursiva, subrayado)
   - Listas con viñetas y numeradas
   - Citas/blockquotes

2. **👁️ Verificar vistas:**
   - `🔗 HTML` → Ver HTML limpio generado
   - `🧠 MD` → Ver Markdown equivalente

3. **📄 Exportar documentos:**
   - `☁️ DOCX` → Exportación vía backend (óptima)
   - `📄 Local` → Exportación local (fallback)

4. **🔍 Validar DOCX generado:**
   - Abrir en Microsoft Word
   - Verificar formato y estilos
   - Comprobar metadata del documento

### 🎯 Resultados Esperados
- **HTML limpio** con CSS inline para docx4j
- **DOCX profesional** indistinguible de Word nativo
- **Fallback automático** si backend no disponible
- **Metadata correcta** (título, autor, fecha)

---

## 🔄 Próximos Pasos

### 🚧 Funcionalidades Avanzadas

1. **📝 Ediciones Incrementales:**
   ```java
   // Solo actualizar párrafos modificados
   XPath xpath = new XPath("//w:p[@id='paragraph-123']");
   wordPackage.getMainDocumentPart().replace(xpath, newContent);
   ```

2. **🤖 Integración AI:**
   ```typescript
   // Enviar párrafo seleccionado para reescritura
   const selectedText = getSelectedText(editor)
   const rewritten = await callOpenAI(selectedText, "make more concise")
   replaceSelectedText(editor, rewritten)
   ```

3. **🔄 Colaboración en Tiempo Real:**
   ```java
   @MessageMapping("/document/{id}/edit")
   public void handleEdit(DocumentEdit edit) {
       // Aplicar cambio vía XPath
       // Notificar a otros usuarios vía WebSocket
   }
   ```

4. **📊 Versioning y Historial:**
   ```sql
   CREATE TABLE document_versions (
       id UUID PRIMARY KEY,
       document_id UUID,
       wordml_content TEXT,
       created_at TIMESTAMP
   );
   ```

---

## 🎉 Resultado Final

Con esta arquitectura híbrida tienes:

- ✅ **Editor visual** moderno (Lexical)
- ✅ **Exportación profesional** (docx4j)
- ✅ **Escalabilidad** (backend independiente)
- ✅ **Compatibilidad total** con Microsoft Word
- ✅ **Base para funcionalidades avanzadas** (AI, colaboración)

**🚀 ¡Tu "cursor-like" para documentos está listo!** 