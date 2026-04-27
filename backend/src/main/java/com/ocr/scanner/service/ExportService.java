package com.ocr.scanner.service;

import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.ocr.scanner.entity.FileMetadata;
import com.ocr.scanner.repository.FileMetadataRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class ExportService {

    @Autowired
    private FileMetadataRepository repository;

    /**
     * Fetches the text for export (prefers editedText, falls back to processedText).
     */
    public String getTextForExport(Long fileId) {
        FileMetadata metadata = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found with ID: " + fileId));
        
        String text = metadata.getEditedText() != null ? metadata.getEditedText() : metadata.getProcessedText();
        if (text == null) text = "";
        return text;
    }

    /**
     * Generates a TXT file stream.
     */
    public ByteArrayInputStream generateTxt(String text) {
        return new ByteArrayInputStream(text.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Generates a PDF file stream using OpenPDF.
     * Fixed: Robust stream management with try-with-resources and proper document closing.
     */
    public ByteArrayInputStream generatePdf(String text) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            
            Font font = new Font(Font.HELVETICA, 12);
            String[] lines = text.split("\n");
            for (String line : lines) {
                document.add(new Paragraph(line, font));
            }
            
            document.close();
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            log.error("Error generating PDF", e);
            throw new RuntimeException("Failed to generate PDF: " + e.getMessage());
        }
    }

    /**
     * Generates a DOCX file stream using Apache POI.
     * Fixed: Already uses try-with-resources.
     */
    public ByteArrayInputStream generateDocx(String text) {
        try (XWPFDocument document = new XWPFDocument(); 
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            String[] lines = text.split("\n");
            for (String line : lines) {
                XWPFParagraph paragraph = document.createParagraph();
                XWPFRun run = paragraph.createRun();
                run.setText(line);
                run.setFontSize(12);
            }
            
            document.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            log.error("Error generating DOCX", e);
            throw new RuntimeException("Failed to generate DOCX: " + e.getMessage());
        }
    }
}
