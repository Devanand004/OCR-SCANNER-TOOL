package com.ocr.scanner.service;

import com.ocr.scanner.dto.HistoryDTO;
import com.ocr.scanner.entity.FileMetadata;
import com.ocr.scanner.repository.FileMetadataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class HistoryService {

    @Autowired
    private FileMetadataRepository repository;

    public Page<HistoryDTO> getHistory(int page, int size, String search, String date) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("uploadTime").descending());
        
        LocalDateTime start = null;
        LocalDateTime end = null;

        if (date != null && !date.isEmpty()) {
            LocalDate localDate = LocalDate.parse(date);
            start = localDate.atStartOfDay();
            end = localDate.atTime(LocalTime.MAX);
        }

        // Use the new unified filter method
        Page<FileMetadata> filePage = repository.findWithFilters(
                (search != null && !search.isEmpty()) ? search : null, 
                start, 
                end, 
                pageable
        );

        return filePage.map(this::convertToDTO);
    }

    public void deleteHistoryItem(Long id) {
        repository.deleteById(id);
    }

    private HistoryDTO convertToDTO(FileMetadata metadata) {
        String preview = metadata.getExtractedText();
        if (preview != null && preview.length() > 100) {
            preview = preview.substring(0, 100) + "...";
        }

        return HistoryDTO.builder()
                .id(metadata.getId())
                .filename(metadata.getFilename())
                .textPreview(preview)
                .uploadTime(metadata.getUploadTime())
                .ocrStatus(metadata.getOcrStatus().toString())
                .fileType(metadata.getFileType())
                .storedFilename(metadata.getStoredFilename()) // Added for UI selection
                .build();
    }
}
