package com.ocr.scanner.service;

import com.ocr.scanner.entity.FileMetadata;
import com.ocr.scanner.repository.FileMetadataRepository;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class OCRService {

    @Autowired
    private ITesseract tesseract;

    @Autowired
    private FileMetadataRepository repository;

    @Async
    public CompletableFuture<FileMetadata> extractText(Long fileId, String language) {
        Optional<FileMetadata> optionalMetadata = repository.findById(fileId);
        if (optionalMetadata.isEmpty()) {
            return CompletableFuture.failedFuture(new RuntimeException("File not found"));
        }

        FileMetadata metadata = optionalMetadata.get();
        metadata.setOcrStatus("PROCESSING");
        repository.save(metadata);

        try {
            // Use the processed image if available, otherwise use the original
            String pathToProcess = (metadata.getProcessedFilePath() != null) 
                    ? metadata.getProcessedFilePath() 
                    : metadata.getFilePath();

            File imageFile = new File(pathToProcess);
            if (!imageFile.exists()) {
                throw new RuntimeException("Image file not found at " + pathToProcess);
            }

            // Configure language (e.g., "eng", "tam", "eng+tam")
            tesseract.setLanguage(language != null ? language : "eng");

            String extractedText = tesseract.doOCR(imageFile);

            metadata.setExtractedText(extractedText);
            metadata.setLanguageUsed(language);
            metadata.setOcrStatus("COMPLETED");
            metadata.setLastUpdated(LocalDateTime.now());
            
            return CompletableFuture.completedFuture(repository.save(metadata));

        } catch (TesseractException e) {
            metadata.setOcrStatus("FAILED");
            metadata.setLastUpdated(LocalDateTime.now());
            repository.save(metadata);
            return CompletableFuture.failedFuture(new RuntimeException("OCR Error: " + e.getMessage()));
        } catch (Exception e) {
            metadata.setOcrStatus("FAILED");
            metadata.setLastUpdated(LocalDateTime.now());
            repository.save(metadata);
            return CompletableFuture.failedFuture(e);
        }
    }
}
