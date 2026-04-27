package com.ocr.scanner.service;

import com.ocr.scanner.entity.Translation;
import com.ocr.scanner.repository.TranslationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@Slf4j
public class TranslationService {

    @Autowired
    private TranslationRepository repository;

    @Value("${translation.api.url:https://libretranslate.de/translate}")
    private String apiUrl;

    @Value("${translation.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String translateText(String text, String targetLanguage) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        String textHash = DigestUtils.md5DigestAsHex(text.getBytes(StandardCharsets.UTF_8));

        // 1. Check Cache (Database) using hash
        Optional<Translation> cached = repository.findFirstByTextHashAndTargetLanguageOrderByCreatedAtDesc(textHash, targetLanguage);
        if (cached.isPresent()) {
            log.info("Returning cached translation for language: {}", targetLanguage);
            return cached.get().getTranslatedText();
        }

        // 2. Call External API
        log.info("Calling translation API for language: {}", targetLanguage);
        String translatedText = callExternalTranslationApi(text, targetLanguage);

        // 3. Save to History (Cache)
        Translation translation = Translation.builder()
                .originalText(text)
                .textHash(textHash)
                .translatedText(translatedText)
                .targetLanguage(targetLanguage)
                .build();
        repository.save(translation);

        return translatedText;
    }

    private String callExternalTranslationApi(String text, String targetLanguage) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("q", text);
            body.put("source", "auto");
            body.put("target", targetLanguage);
            body.put("format", "text");
            if (apiKey != null && !apiKey.isEmpty()) {
                body.put("api_key", apiKey);
            }

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(apiUrl, request, Map.class);
            
            if (response != null && response.containsKey("translatedText")) {
                return (String) response.get("translatedText");
            } else {
                throw new RuntimeException("Unexpected response from translation API");
            }

        } catch (Exception e) {
            log.error("External translation API failed: {}", e.getMessage());
            // Fallback: If it's a demo and external API fails, we can't just return mock if user wants REAL
            // But for resilience, return a helpful message
            throw new RuntimeException("Translation service currently unavailable. Please check internet connection or API key.");
        }
    }
}
