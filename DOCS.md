# OCR Scanner Tool - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Design](#architecture--design)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Database Schema](#database-schema)
6. [API Reference](#api-reference)
7. [Workflow & Logic](#workflow--logic)
8. [Security Implementation](#security-implementation)
9. [Performance Optimizations](#performance-optimizations)
10. [Deployment Guide](#deployment-guide)

## Project Overview

The OCR Scanner Tool is a full-stack web application that provides comprehensive optical character recognition capabilities. It allows users to upload images or capture live video, extract text using Tesseract OCR, edit and process the extracted text, translate it to multiple languages, and export it in various formats.

### Key Features
- **Multi-input Support**: File upload (JPG, PNG, PDF) and live camera capture
- **Image Preprocessing**: Automatic enhancement for better OCR accuracy
- **Multi-language OCR**: Support for English, Hindi, Tamil, and other languages
- **Real-time Text Editing**: Rich text editor with auto-save functionality
- **Multi-language Translation**: Integrated translation service
- **Multi-format Export**: TXT, PDF, and DOCX export options
- **History Management**: Comprehensive dashboard with search and filtering
- **User Authentication**: JWT-based secure authentication system

## Architecture & Design

### System Architecture
The application follows a layered architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Spring Boot) │◄──►│   (MySQL/H2)    │
│                 │    │                 │    │                 │
│ - UI Components │    │ - Controllers   │    │ - Entities      │
│ - State Mgmt    │    │ - Services      │    │ - Repositories  │
│ - API Calls     │    │ - Utilities     │    │ - Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Design Patterns Used
- **MVC Pattern**: Clear separation between controllers, services, and repositories
- **Repository Pattern**: Data access abstraction
- **Service Layer Pattern**: Business logic encapsulation
- **DTO Pattern**: Data transfer object for API responses
- **Factory Pattern**: Object creation for different export formats
- **Observer Pattern**: Real-time status updates for async operations

## Backend Implementation

### Core Components

#### 1. Configuration Layer
- **SecurityConfig.java**: Spring Security configuration with JWT integration
- **TesseractConfig.java**: Tesseract OCR engine configuration
- **WebConfig.java**: Static resource handling for uploads and processed files

#### 2. Controller Layer
- **AuthController**: Handles user authentication (login/register)
- **FileUploadController**: Manages file uploads and validation
- **ImagePreprocessingController**: Controls image enhancement pipeline
- **OCRController**: Orchestrates OCR text extraction
- **TextController**: Handles text editing and retrieval
- **TextProcessingController**: Manages text post-processing
- **TranslationController**: Provides translation services
- **ExportController**: Handles multi-format export generation
- **HistoryController**: Manages file history and search

#### 3. Service Layer
- **OCRService**: Core OCR processing using Tesseract
- **ImagePreprocessingService**: Image enhancement algorithms
- **TextProcessingService**: Text cleaning and formatting
- **TranslationService**: Multi-language translation with caching
- **ExportService**: Dynamic file generation for different formats
- **FileMetadataService**: File metadata management

#### 4. Repository Layer
- **UserRepository**: User authentication data
- **FileMetadataRepository**: File processing metadata
- **TranslationRepository**: Translation cache storage
- **ExportHistoryRepository**: Export tracking
- **LiveOCRLogRepository**: Live OCR session logs

#### 5. Utility Classes
- **ImageUtils**: Image manipulation functions (resize, filter, compress)
- **TextUtils**: Text processing utilities (cleaning, formatting)
- **JwtUtil**: JWT token generation and validation

### Key Algorithms & Logic

#### Image Preprocessing Pipeline
```java
public void processImage(String fileId) {
    // 1. Load original image
    BufferedImage original = ImageUtils.loadImage(fileId);
    
    // 2. Apply grayscale conversion
    BufferedImage grayscale = ImageUtils.toGrayscale(original);
    
    // 3. Apply noise reduction
    BufferedImage denoised = ImageUtils.reduceNoise(grayscale);
    
    // 4. Apply thresholding for binarization
    BufferedImage thresholded = ImageUtils.applyThreshold(denoised);
    
    // 5. Save processed image
    ImageUtils.saveProcessedImage(thresholded, fileId);
}
```

#### OCR Text Extraction
```java
public String extractText(String fileId) {
    try {
        // Load Tesseract instance
        ITesseract tesseract = getTesseractInstance();
        
        // Load processed image
        File imageFile = getProcessedImageFile(fileId);
        
        // Extract text with language specification
        String extractedText = tesseract.doOCR(imageFile);
        
        // Clean and format extracted text
        return TextUtils.cleanExtractedText(extractedText);
        
    } catch (TesseractException e) {
        throw new OCRProcessingException("OCR extraction failed", e);
    }
}
```

#### Async Processing Pattern
```java
@Async
public CompletableFuture<String> processOCRAsync(String fileId) {
    return CompletableFuture.supplyAsync(() -> {
        try {
            // Update status to PROCESSING
            updateFileStatus(fileId, ProcessingStatus.PROCESSING);
            
            // Perform OCR
            String text = extractText(fileId);
            
            // Update status to COMPLETED
            updateFileStatus(fileId, ProcessingStatus.COMPLETED);
            
            return text;
            
        } catch (Exception e) {
            // Update status to FAILED
            updateFileStatus(fileId, ProcessingStatus.FAILED);
            throw e;
        }
    });
}
```

## Frontend Implementation

### Component Architecture

#### Page Components
- **Login/Register**: Authentication forms with validation
- **Dashboard**: Main navigation hub
- **Upload**: File upload interface
- **ProcessingPage**: Step-by-step processing workflow
- **OCRResultPage**: Text editing and export interface

#### Feature Components
- **FileUpload**: Drag-and-drop file upload with validation
- **CameraOCR**: Live webcam capture with OCR
- **ProcessingView**: Real-time processing status display
- **OCRView**: Extracted text display and editing
- **TextEditor**: Rich text editing with auto-save
- **TextPostProcessing**: Text cleaning and formatting tools
- **Translator**: Multi-language translation interface
- **ExportButtons**: Multi-format export controls
- **HistoryDashboard**: Paginated history with search/filter

#### UI Components
- **Button**: Reusable button component
- **Loader**: Loading spinner and progress indicators
- **Toast**: Notification system

### State Management
- **AuthContext**: Global authentication state
- **Local Component State**: React hooks for component-specific state
- **API Integration**: Axios for HTTP requests with interceptors

### Key Frontend Logic

#### File Upload Flow
```jsx
const handleFileUpload = async (files) => {
    // Validate file types and sizes
    const validFiles = validateFiles(files);
    
    // Compress images if needed
    const compressedFiles = await Promise.all(
        validFiles.map(file => compressImage(file))
    );
    
    // Upload to backend
    const uploadPromises = compressedFiles.map(file => 
        uploadFile(file)
    );
    
    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    // Navigate to processing page
    navigate(`/processing/${results[0].fileId}`);
};
```

#### Real-time Text Editing
```jsx
const TextEditor = ({ fileId, initialText }) => {
    const [text, setText] = useState(initialText);
    const [isSaving, setIsSaving] = useState(false);
    
    // Debounced auto-save
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (text !== initialText) {
                setIsSaving(true);
                await saveText(fileId, text);
                setIsSaving(false);
            }
        }, 2000);
        
        return () => clearTimeout(timeoutId);
    }, [text, fileId, initialText]);
    
    return (
        <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Edit extracted text..."
        />
    );
};
```

#### Live Camera OCR
```jsx
const CameraOCR = () => {
    const webcamRef = useRef(null);
    const [isCapturing, setIsCapturing] = useState(false);
    
    const captureAndProcess = async () => {
        const imageSrc = webcamRef.current.getScreenshot();
        const compressedImage = await compressImage(imageSrc);
        
        setIsCapturing(true);
        const result = await performLiveOCR(compressedImage);
        setIsCapturing(false);
        
        // Display result
        setExtractedText(result.text);
    };
    
    return (
        <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
        />
    );
};
```

## Database Schema

### Core Entities

#### User Entity
```sql
CREATE TABLE user (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### FileMetadata Entity
```sql
CREATE TABLE file_metadata (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    processed_file_path VARCHAR(500),
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    user_id BIGINT NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_status ENUM('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'UPLOADED',
    ocr_text LONGTEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_processing_status (processing_status),
    INDEX idx_upload_time (upload_time)
);
```

#### Translation Entity
```sql
CREATE TABLE translation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_text LONGTEXT NOT NULL,
    translated_text LONGTEXT NOT NULL,
    source_language VARCHAR(10) NOT NULL,
    target_language VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_source_target (source_language, target_language),
    INDEX idx_created_at (created_at)
);
```

#### ExportHistory Entity
```sql
CREATE TABLE export_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_metadata_id BIGINT NOT NULL,
    export_format VARCHAR(10) NOT NULL,
    export_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (file_metadata_id) REFERENCES file_metadata(id) ON DELETE CASCADE,
    INDEX idx_file_metadata_id (file_metadata_id),
    INDEX idx_export_time (export_time)
);
```

## API Reference

### Authentication APIs
```
POST /api/auth/register
Body: { username, email, password }
Response: { token, user: { id, username, email } }

POST /api/auth/login
Body: { username, password }
Response: { token, user: { id, username, email } }
```

### File Management APIs
```
POST /api/upload
Content-Type: multipart/form-data
Body: file (image/pdf)
Response: { fileId, fileName, status: 'UPLOADED' }

GET /api/files?page=0&size=10&search=keyword&startDate=2024-01-01&endDate=2024-12-31
Response: { content: [...], totalElements, totalPages }

DELETE /api/files/{fileId}
Response: { success: true }
```

### Processing APIs
```
POST /api/preprocess/{fileId}
Response: { status: 'PROCESSING' }

GET /api/preprocess/{fileId}/status
Response: { status: 'COMPLETED' | 'PROCESSING' | 'FAILED' }

POST /api/ocr/{fileId}
Response: { status: 'PROCESSING' }

GET /api/ocr/{fileId}/result
Response: { text: 'extracted text', confidence: 95.5 }
```

### Text Operations APIs
```
GET /api/text/{fileId}
Response: { text: 'processed text', lastUpdated: '2024-01-01T10:00:00Z' }

PUT /api/text/{fileId}
Body: { text: 'edited text' }
Response: { success: true, lastUpdated: '2024-01-01T10:00:00Z' }

POST /api/text/{fileId}/process
Body: { operations: ['clean', 'format'] }
Response: { processedText: 'cleaned text' }
```

### Translation APIs
```
POST /api/translate
Body: { text: 'source text', targetLanguage: 'ta' }
Response: { translatedText: 'translated text', sourceLanguage: 'en' }
```

### Export APIs
```
GET /api/export/{fileId}/txt
Response: text/plain file download

GET /api/export/{fileId}/pdf
Response: application/pdf file download

GET /api/export/{fileId}/docx
Response: application/vnd.openxmlformats-officedocument.wordprocessingml.document file download
```

## Workflow & Logic

### Complete OCR Processing Workflow

1. **User Authentication**
   - User logs in/registers
   - JWT token issued for session management

2. **File Upload**
   - User selects file or captures from camera
   - File validated (type, size)
   - File compressed if needed
   - File stored in uploads directory
   - FileMetadata record created

3. **Image Preprocessing**
   - Original image loaded
   - Grayscale conversion applied
   - Noise reduction algorithms applied
   - Thresholding for binarization
   - Processed image saved

4. **OCR Processing**
   - Tesseract initialized with language data
   - Processed image loaded
   - Text extraction performed
   - Text cleaned and formatted
   - OCR result stored in database

5. **Text Editing**
   - Extracted text displayed in editor
   - User can edit text in real-time
   - Auto-save with debouncing
   - Changes persisted to database

6. **Text Post-Processing**
   - Text cleaning (remove extra spaces, fix line breaks)
   - Formatting applied
   - Search and highlight functionality

7. **Translation (Optional)**
   - User selects target language
   - Translation service called
   - Result cached for future use
   - Translated text displayed

8. **Export**
   - User selects export format
   - File generated dynamically
   - Binary data streamed to browser
   - Export history recorded

### Async Processing Logic

The application uses Spring's @Async annotation for non-blocking operations:

```java
@Async("taskExecutor")
public CompletableFuture<Void> processFileAsync(String fileId) {
    return CompletableFuture.runAsync(() -> {
        // Step 1: Preprocessing
        imagePreprocessingService.processImage(fileId);
        
        // Step 2: OCR
        String extractedText = ocrService.extractText(fileId);
        
        // Step 3: Text processing
        String processedText = textProcessingService.processText(extractedText);
        
        // Update final status
        fileMetadataService.updateStatus(fileId, COMPLETED);
    });
}
```

### Error Handling & Recovery

```java
try {
    // Processing steps
} catch (ImageProcessingException e) {
    log.error("Image preprocessing failed for file: {}", fileId, e);
    updateStatus(fileId, FAILED);
} catch (OCRProcessingException e) {
    log.error("OCR processing failed for file: {}", fileId, e);
    updateStatus(fileId, FAILED);
} catch (Exception e) {
    log.error("Unexpected error processing file: {}", fileId, e);
    updateStatus(fileId, FAILED);
}
```

## Security Implementation

### Authentication & Authorization
- **JWT Tokens**: Stateless authentication with expiration
- **Password Encryption**: BCrypt hashing for secure storage
- **Role-based Access**: User-level permissions
- **Session Management**: Token refresh mechanism

### Input Validation & Sanitization
- **File Upload Validation**: Type, size, and content checks
- **Text Input Sanitization**: XSS prevention
- **API Input Validation**: Bean validation annotations

### Security Configuration
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/uploads/**", "/processed/**").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement(sess -> sess.sessionCreationPolicy(STATELESS))
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}
```

## Performance Optimizations

### Backend Optimizations
- **Async Processing**: CPU-intensive tasks run asynchronously
- **Connection Pooling**: Database connection optimization
- **Caching**: Translation results cached in database
- **File Streaming**: Large file downloads streamed efficiently
- **Lazy Loading**: JPA relationships loaded on demand

### Frontend Optimizations
- **Code Splitting**: React components loaded lazily
- **Image Compression**: Client-side image optimization
- **Debounced API Calls**: Reduced server requests
- **Virtual Scrolling**: Efficient large list rendering
- **Memoization**: React.memo for expensive components

### Database Optimizations
- **Indexing**: Strategic indexes on frequently queried columns
- **Query Optimization**: Efficient JPQL queries
- **Pagination**: Large result sets paginated
- **Connection Pooling**: Optimized database connections

## Deployment Guide

### Docker Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: ocr_tool
      MYSQL_ROOT_PASSWORD: password
    volumes:
      - mysql_data:/var/lib/mysql
  
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/ocr_tool
  
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database backups scheduled
- [ ] SSL certificates installed
- [ ] File storage permissions set
- [ ] Tesseract language packs installed
- [ ] Monitoring and logging configured
- [ ] Load balancer configured (if needed)
- [ ] CDN setup for static assets (optional)

### Scaling Considerations
- **Horizontal Scaling**: Multiple backend instances behind load balancer
- **Database Scaling**: Read replicas for heavy read operations
- **File Storage**: Cloud storage (S3, GCS) for large-scale deployments
- **Caching Layer**: Redis for session and data caching
- **CDN**: For global content delivery

---

This documentation provides a comprehensive overview of the OCR Scanner Tool's architecture, implementation details, and operational logic. For specific code examples or troubleshooting, refer to the inline comments in the source code or create an issue in the repository.