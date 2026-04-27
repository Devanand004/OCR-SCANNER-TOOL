package com.ocr.scanner.controller;

import com.ocr.scanner.entity.FileMetadata;
import com.ocr.scanner.service.TextProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/process-text")
@CrossOrigin(origins = "*")
public class TextProcessingController {

    @Autowired
    private TextProcessingService textProcessingService;

    /**
     * Trigger text processing for a file.
     * POST /api/v1/process-text/{id}
     */
    @PostMapping("/{id}")
    public ResponseEntity<?> processText(@PathVariable Long id, @RequestBody(required = false) Map<String, String> payload) {
        String manualText = (payload != null) ? payload.get("text") : null;
        
        try {
            FileMetadata result = textProcessingService.processText(id, manualText);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Save manually edited text.
     * PUT /api/v1/process-text/save/{id}
     */
    @PutMapping("/save/{id}")
    public ResponseEntity<?> saveEditedText(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String editedText = payload.get("text");
        if (editedText == null) {
            return ResponseEntity.badRequest().body("Text content is required");
        }
        
        try {
            FileMetadata result = textProcessingService.saveEditedText(id, editedText);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
