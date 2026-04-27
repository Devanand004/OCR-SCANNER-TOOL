package com.ocr.scanner.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "uploaded_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileMetadata {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String filename;
    
    @Column(nullable = false)
    private String storedFilename;
    
    @Column(nullable = false, length = 500)
    private String filePath;
    
    @Column(nullable = false)
    private String fileType;
    
    @Column(nullable = false)
    private Long size;
    
    @Column(length = 500)
    private String processedFilePath;

    @Builder.Default
    @Column(nullable = false)
    private String processingStatus = "PENDING";

    @Column(columnDefinition = "LONGTEXT")
    private String extractedText;

    @Column(columnDefinition = "LONGTEXT")
    private String processedText;

    @Column(columnDefinition = "LONGTEXT")
    private String editedText;

    @Builder.Default
    @Column(nullable = false)
    private String ocrStatus = "PENDING";

    private String languageUsed;

    private LocalDateTime lastUpdated;

    @Column(nullable = false)
    private LocalDateTime uploadTime;

    @PrePersist
    protected void onCreate() {
        if (processingStatus == null) processingStatus = "PENDING";
        uploadTime = LocalDateTime.now();
    }
}
