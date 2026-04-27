package com.ocr.scanner.util;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class TextUtils {

    /**
     * Cleans OCR noise like special characters and artifacts.
     */
    public static String cleanText(String text) {
        if (text == null) return "";
        
        // Remove non-printable characters and strange artifacts
        String cleaned = text.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "");
        
        // Remove common OCR noise (e.g., lone symbols, pipe characters as borders)
        cleaned = cleaned.replaceAll("(?m)^[|\\-._ ]+$", ""); 
        
        return cleaned.trim();
    }

    /**
     * Normalizes spacing: removes extra spaces, tabs, and ensures consistent line breaks.
     */
    public static String normalizeSpacing(String text) {
        if (text == null) return "";
        
        // Replace multiple spaces with a single space
        String normalized = text.replaceAll("[ \\t]+", " ");
        
        // Replace 3 or more newlines with 2 newlines (standard paragraph break)
        normalized = normalized.replaceAll("\\n{3,}", "\n\n");
        
        return normalized.trim();
    }

    /**
     * Detects paragraphs by looking for multiple newlines or specific indent patterns.
     */
    public static String formatParagraphs(String text) {
        if (text == null) return "";
        
        String[] lines = text.split("\\n");
        StringBuilder result = new StringBuilder();
        StringBuilder currentParagraph = new StringBuilder();

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) {
                if (currentParagraph.length() > 0) {
                    result.append(currentParagraph.toString().trim()).append("\n\n");
                    currentParagraph.setLength(0);
                }
            } else {
                currentParagraph.append(line).append(" ");
            }
        }
        
        if (currentParagraph.length() > 0) {
            result.append(currentParagraph.toString().trim());
        }

        return result.toString().trim();
    }

    /**
     * Identifies potential headings (uppercase lines or shorter lines).
     */
    public static String detectStructure(String text) {
        if (text == null) return "";
        
        String[] blocks = text.split("\\n\\n");
        StringBuilder structured = new StringBuilder();

        for (String block : blocks) {
            block = block.trim();
            if (block.isEmpty()) continue;

            // Check if block is a heading: 
            // 1. All uppercase (ignoring numbers/symbols)
            // 2. Short (less than 60 chars)
            if (block.length() < 100 && block.equals(block.toUpperCase()) && block.matches(".*[A-Z].*")) {
                structured.append("## ").append(block).append("\n\n");
            } else {
                structured.append(block).append("\n\n");
            }
        }

        return structured.toString().trim();
    }

    /**
     * Fixes basic capitalization (sentences start with uppercase).
     */
    public static String correctCapitalization(String text) {
        if (text == null) return "";
        
        Pattern pattern = Pattern.compile("(^|[.!?]\\s+)([a-z])");
        Matcher matcher = pattern.matcher(text);
        StringBuilder sb = new StringBuilder();
        int lastIdx = 0;
        
        while (matcher.find()) {
            sb.append(text, lastIdx, matcher.start());
            sb.append(matcher.group(1)).append(matcher.group(2).toUpperCase());
            lastIdx = matcher.end();
        }
        sb.append(text.substring(lastIdx));
        
        return sb.toString();
    }

    /**
     * Simple dictionary-based correction for common OCR errors.
     */
    public static String basicSpellCorrection(String text) {
        if (text == null) return "";
        
        // Common OCR misreads
        text = text.replaceAll("\\b0f\\b", "of");
        text = text.replaceAll("\\bl\\b(?=\\s)", "I");
        text = text.replaceAll("(?i)\\blhe\\b", "the");
        text = text.replaceAll("(?i)\\bandd\\b", "and");
        text = text.replaceAll("(?i)\\bvith\\b", "with");
        
        return text;
    }
    /**
     * Chains all processing steps together.
     */
    public static String processAll(String text) {
        if (text == null) return "";
        String result = cleanText(text);
        result = normalizeSpacing(result);
        result = formatParagraphs(result);
        result = detectStructure(result);
        result = correctCapitalization(result);
        result = basicSpellCorrection(result);
        return result;
    }

    /**
     * Basic sanitization to prevent XSS if text is rendered as HTML.
     */
    public static String sanitize(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;")
                   .replace("'", "&#x27;")
                   .replace("/", "&#x2F;");
    }
}
