package com.ocr.scanner.service;

import com.ocr.scanner.entity.FileMetadata;
import com.ocr.scanner.repository.FileMetadataRepository;
import com.ocr.scanner.util.ImageUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class ImagePreprocessingService {

    @Autowired
    private FileMetadataRepository repository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Value("${file.processed-dir:processed}")
    private String processedDir;

    @Async
    public CompletableFuture<FileMetadata> processImage(Long fileId) {
        Optional<FileMetadata> optionalMetadata = repository.findById(fileId);
        if (optionalMetadata.isEmpty()) {
            return CompletableFuture.failedFuture(new RuntimeException("File not found"));
        }

        FileMetadata metadata = optionalMetadata.get();
        metadata.setProcessingStatus("PROCESSING");
        repository.save(metadata);

        try {
            // Read original file
            File originalFile = new File(metadata.getFilePath());
            if (!originalFile.exists()) {
                throw new IOException("Original file missing: " + metadata.getFilePath());
            }

            BufferedImage image = null;
            String extension = metadata.getFilePath().substring(metadata.getFilePath().lastIndexOf(".") + 1).toLowerCase();
            
            if (extension.equals("pdf")) {
                // PDF processing not supported by ImageIO, skip enhancement
                metadata.setProcessingStatus("COMPLETED");
                metadata.setProcessedFilePath(metadata.getFilePath());
                return CompletableFuture.completedFuture(repository.save(metadata));
            }

            image = ImageIO.read(originalFile);
            if (image == null) {
                throw new IOException("Invalid image format or unsupported type: " + extension);
            }

            // 1. Resize if too large (performance optimization)
            image = ImageUtils.resize(image, 2000);

            // 2. Convert to Grayscale
            image = ImageUtils.convertToGrayscale(image);

            // 3. Denoise
            image = ImageUtils.denoise(image);

            // 4. Threshold (Binarize)
            image = ImageUtils.applyThreshold(image);

            // Save processed image
            Path processedPath = Paths.get(processedDir);
            if (!Files.exists(processedPath)) {
                Files.createDirectories(processedPath);
            }

            String fileName = "processed-" + UUID.randomUUID().toString() + ".png";
            Path filePath = processedPath.resolve(fileName);
            ImageIO.write(image, "png", filePath.toFile());

            // Update Metadata
            metadata.setProcessedFilePath(filePath.toString());
            metadata.setProcessingStatus("COMPLETED");
            metadata.setLastUpdated(LocalDateTime.now());
            return CompletableFuture.completedFuture(repository.save(metadata));

        } catch (Exception e) {
            metadata.setProcessingStatus("FAILED");
            repository.save(metadata);
            return CompletableFuture.failedFuture(e);
        }
    }
}
