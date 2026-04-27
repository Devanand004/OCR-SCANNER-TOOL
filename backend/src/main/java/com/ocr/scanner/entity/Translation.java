package com.ocr.scanner.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "translations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Translation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String originalText;

    @Column(nullable = false, length = 64)
    private String textHash;
    
    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String translatedText;
    
    @Column(nullable = false)
    private String targetLanguage;
    
    private String sourceLanguage; // Optional: auto-detected
    
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
