# OCR Scanner Tool - Full Implementation

A complete, production-ready OCR Scanner application featuring image enhancement, text extraction, real-time editing, multi-language translation, and multi-format export. Built with modern web technologies and robust backend processing.

## Overview

This application provides a comprehensive OCR (Optical Character Recognition) solution that allows users to upload images or capture live video, extract text using advanced OCR technology, edit and process the text, translate it to multiple languages, and export it in various formats. The system includes user authentication, history tracking, and a responsive UI.

## Features

### 1. User Authentication
- JWT-based authentication system
- User registration and login
- Protected routes for authenticated users
- Persistent login state

### 2. File Upload & Input
- **Drag-and-drop file upload** supporting JPG, PNG, and PDF formats
- **Live camera capture** with real-time webcam integration
- **File validation** with size limits (10MB) and type checking
- **Image compression** for optimized processing

### 3. Image Preprocessing
- **Automatic image enhancement** including:
  - Grayscale conversion
  - Noise reduction
  - Thresholding (binarization)
  - Resize optimization
- **PDF handling** with automatic conversion to images
- **Processing status tracking** with real-time updates

### 4. OCR Text Extraction
- **Tesseract OCR integration** with tess4j library
- **Multi-language support** (English, Hindi, Tamil, and more)
- **High-accuracy text extraction** from processed images
- **Async processing** with status monitoring
- **Error handling** and retry mechanisms

### 5. Text Post-Processing & Editing
- **Real-time text editor** with rich formatting
- **Auto-save functionality** with debounced saving (2-second intervals)
- **Text cleaning and formatting** utilities
- **Character and line counting**
- **Search and highlight** features for keywords, emails, and dates

### 6. Translation Module
- **Multi-language translation** support
- **Supported languages**: Tamil, Hindi, English, Spanish, French, German
- **Integrated translation UI** within the editor
- **Translation caching** for performance optimization

### 7. Export Functionality
- **Multiple export formats**:
  - Plain Text (.txt)
  - PDF (.pdf) using OpenPDF
  - Microsoft Word (.docx) using Apache POI
- **Dynamic file generation** and download
- **Export history tracking**

### 8. History & Dashboard
- **Comprehensive history dashboard** with pagination
- **Advanced search** by filename or content
- **Date filtering** for targeted searches
- **File management** with delete functionality
- **Status tracking** for all processed files

### 9. Responsive UI/UX
- **Modern glassmorphism design** with Tailwind CSS
- **Responsive layout** for desktop and mobile
- **Real-time feedback** and loading states
- **Toast notifications** for user actions
- **Accessible navigation** with protected routes

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.2.5
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: MySQL (production) / H2 (development)
- **ORM**: Hibernate/JPA
- **Security**: Spring Security with JWT
- **OCR Engine**: Tesseract via tess4j
- **File Processing**: OpenPDF, Apache POI
- **Async Processing**: Spring's @Async with CompletableFuture

### Frontend
- **Framework**: React 19.2.5
- **Build Tool**: Vite 8.0.10
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **File Upload**: React Dropzone
- **Camera Integration**: React Webcam
- **State Management**: React Context API

### Infrastructure
- **Containerization**: Docker Compose for full-stack deployment
- **Database**: MySQL 8.0 with Hibernate DDL auto-update
- **File Storage**: Local filesystem with organized directory structure
- **API Documentation**: RESTful endpoints with JSON responses

## Project Structure

```
ocr-scanner-tool/
├── backend/
│   ├── src/main/java/com/ocr/scanner/
│   │   ├── BackendApplication.java
│   │   ├── config/
│   │   │   ├── JwtFilter.java
│   │   │   ├── JwtUtil.java
│   │   │   ├── SecurityConfig.java
│   │   │   └── TesseractConfig.java
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── ExportController.java
│   │   │   ├── FileUploadController.java
│   │   │   ├── HistoryController.java
│   │   │   ├── ImagePreprocessingController.java
│   │   │   ├── LiveOCRController.java
│   │   │   ├── OCRController.java
│   │   │   ├── TextController.java
│   │   │   ├── TextProcessingController.java
│   │   │   └── TranslationController.java
│   │   ├── dto/
│   │   │   ├── HistoryDTO.java
│   │   │   ├── TextUpdateDTO.java
│   │   │   └── TranslationDTO.java
│   │   ├── entity/
│   │   │   ├── ExportHistory.java
│   │   │   ├── FileMetadata.java
│   │   │   ├── LiveOCRLog.java
│   │   │   ├── Translation.java
│   │   │   └── User.java
│   │   ├── repository/
│   │   │   ├── ExportHistoryRepository.java
│   │   │   ├── FileMetadataRepository.java
│   │   │   ├── LiveOCRLogRepository.java
│   │   │   ├── TranslationRepository.java
│   │   │   └── UserRepository.java
│   │   ├── service/
│   │   │   ├── ExportService.java
│   │   │   ├── FileMetadataService.java
│   │   │   ├── ImagePreprocessingService.java
│   │   │   ├── OCRService.java
│   │   │   ├── TextProcessingService.java
│   │   │   └── TranslationService.java
│   │   └── util/
│   │       ├── ImageUtils.java
│   │       ├── TextUtils.java
│   │       └── WebConfig.java
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CameraOCR.jsx
│   │   │   ├── ExportButtons.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── HistoryDashboard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── OCRView.jsx
│   │   │   ├── ProcessingView.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── TextEditor.jsx
│   │   │   ├── TextPostProcessing.jsx
│   │   │   ├── Translator.jsx
│   │   │   └── ui/
│   │   │       ├── Button.jsx
│   │   │       ├── Loader.jsx
│   │   │       └── Toast.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── OCRResultPage.jsx
│   │   │   ├── ProcessingPage.jsx
│   │   │   ├── Register.jsx
│   │   │   └── Upload.jsx
│   │   └── services/
│   │       └── api.js
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Node.js 18 or higher
- MySQL 8.0
- Tesseract OCR installed on the system
- Docker (optional, for containerized deployment)

### Backend Setup
1. **Install Tesseract OCR**:
   - Windows: Download from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki)
   - Linux/Mac: `sudo apt install tesseract-ocr` or `brew install tesseract`

2. **Database Setup**:
   ```sql
   CREATE DATABASE ocr_tool;
   ```

3. **Configure Application**:
   Update `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/ocr_tool
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   file.upload-dir=uploads
   file.processed-dir=processed
   tesseract.data-path=C:/Program Files/Tesseract-OCR/tessdata
   ```

4. **Run Backend**:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup
1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

### Docker Deployment (Optional)
1. **Build and Run**:
   ```bash
   docker-compose up --build
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### File Management
- `POST /api/upload` - Upload file for processing
- `GET /api/files` - Get user's file history
- `DELETE /api/files/{id}` - Delete a file

### Processing Endpoints
- `POST /api/preprocess/{fileId}` - Start image preprocessing
- `GET /api/preprocess/{fileId}/status` - Get preprocessing status
- `POST /api/ocr/{fileId}` - Start OCR processing
- `GET /api/ocr/{fileId}/result` - Get OCR result

### Text Operations
- `GET /api/text/{fileId}` - Get processed text
- `PUT /api/text/{fileId}` - Update edited text
- `POST /api/text/{fileId}/process` - Post-process text

### Export Endpoints
- `GET /api/export/{fileId}/txt` - Export as TXT
- `GET /api/export/{fileId}/pdf` - Export as PDF
- `GET /api/export/{fileId}/docx` - Export as DOCX

### Translation
- `POST /api/translate` - Translate text

## Security Features
- JWT token-based authentication
- Password encryption with BCrypt
- CORS configuration for cross-origin requests
- Input validation and sanitization
- File upload restrictions

## Performance Optimizations
- Async processing for CPU-intensive tasks
- Image compression before OCR
- Debounced auto-save to reduce API calls
- Pagination for large datasets
- Caching for translation results

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Built with modern web technologies for high-performance OCR processing.*
