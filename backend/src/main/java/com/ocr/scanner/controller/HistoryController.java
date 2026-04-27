package com.ocr.scanner.controller;

import com.ocr.scanner.dto.HistoryDTO;
import com.ocr.scanner.service.HistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/history")
@CrossOrigin(origins = "*")
public class HistoryController {

    @Autowired
    private HistoryService historyService;

    @GetMapping
    public ResponseEntity<Page<HistoryDTO>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String date) {
        
        return ResponseEntity.ok(historyService.getHistory(page, size, search, date));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteHistoryItem(@PathVariable Long id) {
        try {
            historyService.deleteHistoryItem(id);
            return ResponseEntity.ok(Map.of("message", "History item deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
