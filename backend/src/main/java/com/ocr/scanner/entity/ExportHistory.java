package com.ocr.scanner.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "export_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExportHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long fileId;
    
    @Column(nullable = false)
    private String exportType; // TXT, PDF, DOCX
    
    @Column(nullable = false)
    private String filename;
    
    @Column(nullable = false)
    private LocalDateTime exportTime;

    @PrePersist
    protected void onCreate() {
        exportTime = LocalDateTime.now();
    }
}
