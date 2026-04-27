package com.ocr.scanner.repository;

import com.ocr.scanner.entity.LiveOCRLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LiveOCRLogRepository extends JpaRepository<LiveOCRLog, Long> {
}
