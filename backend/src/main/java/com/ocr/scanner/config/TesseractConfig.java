package com.ocr.scanner.config;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TesseractConfig {

    @Value("${tesseract.data-path:tessdata}")
    private String dataPath;

    @Bean
    public ITesseract tesseract() {
        ITesseract tesseract = new Tesseract();
        // Set the path to the tessdata folder containing language files (.traineddata)
        tesseract.setDatapath(dataPath);
        return tesseract;
    }
}
