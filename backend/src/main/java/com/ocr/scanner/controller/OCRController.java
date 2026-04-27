package com.ocr.scanner.controller;

import com.ocr.scanner.repository.FileMetadataRepository;
import com.ocr.scanner.service.OCRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/ocr")
@CrossOrigin(origins = "*")
public class OCRController {

    @Autowired
    private OCRService ocrService;

    @Autowired
    private FileMetadataRepository repository;

    @PostMapping("/extract/{id}")
    public ResponseEntity<?> triggerOCR(@PathVariable Long id, @RequestParam(required = false) String lang) {
        ocrService.extractText(id, lang);
        Map<String, String> response = new HashMap<>();
        response.put("message", "OCR processing started");
        response.put("status", "PROCESSING");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/result/{id}")
    public ResponseEntity<?> getOCRResult(@PathVariable Long id) {
        return repository.findById(id)
                .map(metadata -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", metadata.getOcrStatus());
                    response.put("text", metadata.getExtractedText());
                    response.put("language", metadata.getLanguageUsed());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
