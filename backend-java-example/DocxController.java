package com.docseditor.backend.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.docx4j.openpackaging.packages.WordprocessingMLPackage;
import org.docx4j.openpackaging.parts.WordprocessingML.MainDocumentPart;
import org.docx4j.openpackaging.parts.DocPropsCorePart;
import org.docx4j.convert.in.xhtml.XHTMLImporterImpl;
import org.docx4j.convert.in.xhtml.FormattingOption;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

/**
 * Controlador para convertir HTML de Lexical a DOCX usando docx4j
 * 
 * Arquitectura: Frontend (Lexical) → HTML → Spring Boot + docx4j → DOCX
 */
@RestController
@RequestMapping("/api/docx")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class DocxController {

    /**
     * Convertir HTML limpio de Lexical a DOCX
     * 
     * @param request Objeto con HTML, filename y metadata
     * @return Archivo DOCX como ResponseEntity
     */
    @PostMapping("/convert")
    public ResponseEntity<byte[]> htmlToDocx(@RequestBody HtmlToDocxRequest request) {
        try {
            // 1. Crear WordprocessingMLPackage vacío
            WordprocessingMLPackage wordPackage = WordprocessingMLPackage.createPackage();

            // 2. Configurar ImportXHTML con opciones de formateo
            XHTMLImporterImpl importer = new XHTMLImporterImpl(wordPackage);
            importer.setTableFormatting(FormattingOption.OUTPUT_CALC_TBL_LAYOUTS);
            
            // 3. Convertir HTML a WordML y agregarlo al documento
            MainDocumentPart mainDocumentPart = wordPackage.getMainDocumentPart();
            mainDocumentPart.getContent().addAll(
                importer.convert(request.getHtml(), null) // baseURL null para rutas absolutas
            );

            // 4. Agregar metadata del documento
            setDocumentMetadata(wordPackage, request.getMetadata());

            // 5. Convertir a bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            wordPackage.save(outputStream);
            byte[] docxBytes = outputStream.toByteArray();

            // 6. Preparar headers para descarga
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.setContentDispositionFormData("attachment", request.getFilename());
            headers.setContentLength(docxBytes.length);

            System.out.println("✅ Documento DOCX generado exitosamente: " + request.getFilename());
            System.out.println("📊 Tamaño: " + docxBytes.length + " bytes");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(docxBytes);

        } catch (Exception e) {
            System.err.println("❌ Error convirtiendo HTML a DOCX: " + e.getMessage());
            e.printStackTrace();
            
            return ResponseEntity.internalServerError()
                    .body(("Error: " + e.getMessage()).getBytes());
        }
    }

    /**
     * Endpoint de health check
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "OK",
            "service", "docx4j-converter",
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            "version", "1.0.0"
        ));
    }

    /**
     * Endpoint para obtener información sobre capacidades
     */
    @GetMapping("/capabilities")
    public ResponseEntity<Map<String, Object>> getCapabilities() {
        return ResponseEntity.ok(Map.of(
            "supportedFormats", new String[]{"HTML", "XHTML"},
            "outputFormats", new String[]{"DOCX", "WordprocessingML"},
            "features", Map.of(
                "tables", true,
                "images", true,
                "styles", true,
                "headings", true,
                "lists", true,
                "metadata", true
            ),
            "limitations", Map.of(
                "css", "Basic CSS support - no flexbox/grid",
                "javascript", "Not supported",
                "mathml", "Limited support"
            )
        ));
    }

    /**
     * Configurar metadata del documento
     */
    private void setDocumentMetadata(WordprocessingMLPackage wordPackage, DocumentMetadata metadata) {
        try {
            DocPropsCorePart coreProps = wordPackage.getDocPropsCorePart();
            
            if (metadata != null) {
                if (metadata.getTitle() != null) {
                    coreProps.setTitle(metadata.getTitle());
                }
                if (metadata.getCreator() != null) {
                    coreProps.setCreator(metadata.getCreator());
                }
                if (metadata.getDescription() != null) {
                    coreProps.setDescription(metadata.getDescription());
                }
            }
            
            // Timestamp de creación
            coreProps.setCreated(new java.util.Date());
            coreProps.setModified(new java.util.Date());
            
        } catch (Exception e) {
            System.err.println("⚠️ Error configurando metadata: " + e.getMessage());
        }
    }

    /**
     * DTO para request de conversión
     */
    public static class HtmlToDocxRequest {
        private String html;
        private String filename;
        private DocumentMetadata metadata;

        // Constructors
        public HtmlToDocxRequest() {}

        public HtmlToDocxRequest(String html, String filename, DocumentMetadata metadata) {
            this.html = html;
            this.filename = filename;
            this.metadata = metadata;
        }

        // Getters y Setters
        public String getHtml() { return html; }
        public void setHtml(String html) { this.html = html; }

        public String getFilename() { return filename != null ? filename : "documento.docx"; }
        public void setFilename(String filename) { this.filename = filename; }

        public DocumentMetadata getMetadata() { return metadata; }
        public void setMetadata(DocumentMetadata metadata) { this.metadata = metadata; }
    }

    /**
     * DTO para metadata del documento
     */
    public static class DocumentMetadata {
        private String title;
        private String creator;
        private String description;

        // Constructors
        public DocumentMetadata() {}

        public DocumentMetadata(String title, String creator, String description) {
            this.title = title;
            this.creator = creator;
            this.description = description;
        }

        // Getters y Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCreator() { return creator; }
        public void setCreator(String creator) { this.creator = creator; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
    }
} 