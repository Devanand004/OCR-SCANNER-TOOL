package com.ocr.scanner.service;

import com.ocr.scanner.entity.FileMetadata;
import com.ocr.scanner.repository.FileMetadataRepository;
import com.ocr.scanner.util.TextUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
public class TextProcessingService {

    @Autowired
    private FileMetadataRepository repository;

    /**
     * Processes the extracted text for a given file ID.
     * @param fileId The ID of the file to process.
     * @param manualText Optional manual text to process instead of the stored extracted text.
     * @return The updated FileMetadata object.
     */
    @Transactional
    public FileMetadata processText(Long fileId, String manualText) {
        log.info("Processing text for file ID: {}", fileId);
        
        Optional<FileMetadata> optionalMetadata = repository.findById(fileId);
        if (optionalMetadata.isEmpty()) {
            throw new RuntimeException("File metadata not found for ID: " + fileId);
        }

        FileMetadata metadata = optionalMetadata.get();
        String textToProcess = (manualText != null && !manualText.trim().isEmpty()) 
                ? manualText 
                : metadata.getExtractedText();

        if (textToProcess == null || textToProcess.trim().isEmpty()) {
            log.warn("No text found to process for file ID: {}", fileId);
            metadata.setProcessingStatus("NO_TEXT");
            return repository.save(metadata);
        }

        try {
            metadata.setProcessingStatus("PROCESSING_TEXT");
            repository.saveAndFlush(metadata);

            // Apply transformations
            String processed = TextUtils.processAll(textToProcess);
            
            metadata.setProcessedText(processed);
            metadata.setProcessingStatus("COMPLETED");
            metadata.setLastUpdated(LocalDateTime.now());
            
            log.info("Successfully processed text for file ID: {}", fileId);
            return repository.save(metadata);
            
        } catch (Exception e) {
            log.error("Error during text processing for file ID: {}", fileId, e);
            metadata.setProcessingStatus("FAILED_TEXT_PROC");
            return repository.save(metadata);
        }
    }

    /**
     * Saves manual edits to the processed text.
     */
    @Transactional
    public FileMetadata saveEditedText(Long fileId, String editedText) {
        FileMetadata metadata = repository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        
        metadata.setProcessedText(editedText);
        metadata.setLastUpdated(LocalDateTime.now());
        return repository.save(metadata);
    }
}
