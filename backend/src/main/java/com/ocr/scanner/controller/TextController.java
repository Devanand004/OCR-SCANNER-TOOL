package com.ocr.scanner.controller;

import com.ocr.scanner.dto.TextUpdateDTO;
import com.ocr.scanner.entity.FileMetadata;
import com.ocr.scanner.service.TextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/text")
@CrossOrigin(origins = "*")
public class TextController {

    @Autowired
    private TextService textService;

    /**
     * GET /api/v1/text/{id}
     * Returns processed and edited text for a file.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getText(@PathVariable Long id) {
        try {
            FileMetadata metadata = textService.getTextData(id);
            Map<String, Object> response = new HashMap<>();
            response.put("id", metadata.getId());
            response.put("filename", metadata.getFilename());
            response.put("processedText", metadata.getProcessedText());
            response.put("editedText", metadata.getEditedText());
            response.put("lastUpdated", metadata.getLastUpdated());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "An internal error occurred"));
        }
    }

    /**
     * PUT /api/v1/text/{id}
     * Updates the edited text for a file.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateText(@PathVariable Long id, @RequestBody TextUpdateDTO payload) {
        if (payload == null || payload.getText() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text content is required"));
        }
        
        try {
            FileMetadata updated = textService.updateText(id, payload.getText());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Failed to update text"));
        }
    }
}
