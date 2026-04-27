package com.ocr.scanner.repository;

import com.ocr.scanner.entity.FileMetadata;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FileMetadataRepository extends JpaRepository<FileMetadata, Long> {
    List<FileMetadata> findAllByOrderByUploadTimeDesc();
    
    Page<FileMetadata> findAll(Pageable pageable);
    
    Page<FileMetadata> findByFilenameContainingIgnoreCaseOrExtractedTextContainingIgnoreCase(
            String filename, String extractedText, Pageable pageable);

    Page<FileMetadata> findByUploadTimeBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    @Query("SELECT f FROM FileMetadata f WHERE " +
            "(:search IS NULL OR LOWER(f.filename) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(f.extractedText) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:start IS NULL OR f.uploadTime >= :start) AND " +
            "(:end IS NULL OR f.uploadTime <= :end)")
    Page<FileMetadata> findWithFilters(
            @Param("search") String search, 
            @Param("start") LocalDateTime start, 
            @Param("end") LocalDateTime end, 
            Pageable pageable);
}
