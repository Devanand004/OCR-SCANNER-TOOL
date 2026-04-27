package com.ocr.scanner.service;

import com.ocr.scanner.entity.FileMetadata;
import com.ocr.scanner.repository.FileMetadataRepository;
import com.ocr.scanner.util.TextUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
public class TextService {

    @Autowired
    private FileMetadataRepository repository;

    /**
     * Retrieves text data for a specific file.
     */
    public FileMetadata getTextData(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File with ID " + id + " not found"));
    }

    /**
     * Updates the edited text and sets the lastUpdated timestamp.
     */
    @Transactional
    public FileMetadata updateText(Long id, String editedText) {
        log.info("Updating edited text for file ID: {}", id);
        
        if (editedText == null) {
            throw new IllegalArgumentException("Text content cannot be null");
        }

        FileMetadata metadata = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File with ID " + id + " not found"));
        
        // Sanitize input to prevent XSS
        String sanitizedText = TextUtils.sanitize(editedText);
        
        metadata.setEditedText(sanitizedText);
        metadata.setLastUpdated(LocalDateTime.now());
        
        return repository.save(metadata);
    }
}
