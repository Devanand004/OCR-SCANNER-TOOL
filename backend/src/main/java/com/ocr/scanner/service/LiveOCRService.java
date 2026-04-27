package com.ocr.scanner.service;

import com.ocr.scanner.entity.LiveOCRLog;
import com.ocr.scanner.repository.LiveOCRLogRepository;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class LiveOCRService {

    @Autowired
    private LiveOCRLogRepository repository;

    @Value("${tesseract.data-path:}")
    private String tesseractDataPath;

    // Singleton Tesseract instance (Tess4J Tesseract is not thread-safe, so we synchronize access)
    private final ITesseract tesseractInstance;

    public LiveOCRService() {
        this.tesseractInstance = new Tesseract();
        // Configuration can be moved to @PostConstruct if path is injected
    }

    /**
     * Processes a live frame (Base64) and returns the extracted text and confidence.
     * Synchronized to prevent SegFaults from concurrent native access.
     */
    public synchronized Map<String, Object> processLiveFrame(String base64Image) {
        if (tesseractDataPath != null && !tesseractDataPath.isEmpty()) {
            tesseractInstance.setDatapath(tesseractDataPath);
        }

        try {
            if (base64Image.contains(",")) {
                base64Image = base64Image.split(",")[1];
            }

            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            
            // Use try-with-resources for the input stream
            try (ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes)) {
                BufferedImage bufferedImage = ImageIO.read(bais);

                if (bufferedImage == null) {
                    throw new IOException("Failed to decode image from Base64");
                }

                String text = tesseractInstance.doOCR(bufferedImage);
                
                // Log to database
                LiveOCRLog logEntry = LiveOCRLog.builder()
                        .capturedText(text)
                        .confidenceScore(0.0)
                        .build();
                repository.save(logEntry);

                Map<String, Object> result = new HashMap<>();
                result.put("text", text.trim());
                result.put("confidence", 0.0);
                return result;
            }

        } catch (TesseractException | IOException e) {
            log.error("Live OCR failed", e);
            throw new RuntimeException("OCR Processing Error: " + e.getMessage());
        }
    }
}
