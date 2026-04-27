package com.ocr.scanner.repository;

import com.ocr.scanner.entity.Translation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TranslationRepository extends JpaRepository<Translation, Long> {
    Optional<Translation> findFirstByTextHashAndTargetLanguageOrderByCreatedAtDesc(String textHash, String targetLanguage);
}
