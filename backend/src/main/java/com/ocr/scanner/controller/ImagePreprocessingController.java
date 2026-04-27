package com.ocr.scanner.controller;

import com.ocr.scanner.entity.FileMetadata;
import com.ocr.scanner.repository.FileMetadataRepository;
import com.ocr.scanner.service.ImagePreprocessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/process")
@CrossOrigin(origins = "*")
public class ImagePreprocessingController {

    @Autowired
    private ImagePreprocessingService preprocessingService;

    @Autowired
    private FileMetadataRepository repository;

    @PostMapping("/{id}")
    public ResponseEntity<?> triggerPreprocessing(@PathVariable Long id) {
        preprocessingService.processImage(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Processing started");
        response.put("status", "PROCESSING");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{id}")
    public ResponseEntity<?> getStatus(@PathVariable Long id) {
        return repository.findById(id)
                .map(metadata -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("status", metadata.getProcessingStatus());
                    response.put("processedUrl", metadata.getProcessedFilePath());
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
