package com.ocr.scanner.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TranslationDTO {
    private String text;
    private String targetLanguage;
    private String translatedText;
    private String sourceLanguage;
}
