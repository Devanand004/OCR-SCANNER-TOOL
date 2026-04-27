package com.ocr.scanner.controller;

import com.ocr.scanner.service.LiveOCRService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ocr")
@CrossOrigin(origins = "*")
public class LiveOCRController {

    @Autowired
    private LiveOCRService liveOCRService;

    /**
     * POST /api/v1/ocr/live
     * Receives a live frame as Base64 and returns the extracted text.
     */
    @PostMapping("/live")
    public ResponseEntity<?> processLiveFrame(@RequestBody Map<String, String> payload) {
        String base64Image = payload.get("image");
        if (base64Image == null || base64Image.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image data is missing"));
        }

        try {
            Map<String, Object> result = liveOCRService.processLiveFrame(base64Image);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
