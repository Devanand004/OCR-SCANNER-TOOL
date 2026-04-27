package com.ocr.scanner.controller;

import com.ocr.scanner.dto.TranslationDTO;
import com.ocr.scanner.service.TranslationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/translate")
@CrossOrigin(origins = "*")
public class TranslationController {

    @Autowired
    private TranslationService translationService;

    /**
     * POST /api/v1/translate
     * Body: { "text": "...", "targetLanguage": "..." }
     */
    @PostMapping
    public ResponseEntity<?> translate(@RequestBody TranslationDTO request) {
        if (request.getText() == null || request.getText().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Text to translate is required"));
        }
        if (request.getTargetLanguage() == null || request.getTargetLanguage().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Target language is required"));
        }

        try {
            String translatedText = translationService.translateText(request.getText(), request.getTargetLanguage());
            
            TranslationDTO response = TranslationDTO.builder()
                    .text(request.getText())
                    .targetLanguage(request.getTargetLanguage())
                    .translatedText(translatedText)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
