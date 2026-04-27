package com.ocr.scanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistoryDTO {
    private Long id;
    private String filename;
    private String textPreview;
    private LocalDateTime uploadTime;
    private String ocrStatus;
    private String fileType;
    private String storedFilename;
}
