package com.ocr.scanner.controller;

import com.ocr.scanner.entity.ExportHistory;
import com.ocr.scanner.repository.ExportHistoryRepository;
import com.ocr.scanner.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/v1/export")
@CrossOrigin(origins = "*")
public class ExportController {

    @Autowired
    private ExportService exportService;

    @Autowired
    private ExportHistoryRepository historyRepository;

    private String getTimestampFilename(String baseName, String extension) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return baseName + "_" + timestamp + "." + extension;
    }

    private void logExport(Long fileId, String type, String filename) {
        ExportHistory history = ExportHistory.builder()
                .fileId(fileId)
                .exportType(type)
                .filename(filename)
                .exportTime(LocalDateTime.now())
                .build();
        historyRepository.save(history);
    }

    @GetMapping("/txt/{id}")
    public ResponseEntity<InputStreamResource> exportTxt(@PathVariable Long id) {
        String text = exportService.getTextForExport(id);
        ByteArrayInputStream bis = exportService.generateTxt(text);
        
        String filename = getTimestampFilename("exported_text", "txt");
        logExport(id, "TXT", filename);
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.TEXT_PLAIN)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/pdf/{id}")
    public ResponseEntity<InputStreamResource> exportPdf(@PathVariable Long id) {
        String text = exportService.getTextForExport(id);
        ByteArrayInputStream bis = exportService.generatePdf(text);
        
        String filename = getTimestampFilename("exported_text", "pdf");
        logExport(id, "PDF", filename);
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(bis));
    }

    @GetMapping("/docx/{id}")
    public ResponseEntity<InputStreamResource> exportDocx(@PathVariable Long id) {
        String text = exportService.getTextForExport(id);
        ByteArrayInputStream bis = exportService.generateDocx(text);
        
        String filename = getTimestampFilename("exported_text", "docx");
        logExport(id, "DOCX", filename);
        
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .body(new InputStreamResource(bis));
    }
}
