# CORD-19 Information Retrieval System - Web Application

A modern web application implementing advanced information retrieval techniques for COVID-19 research papers using the CORD-19 dataset.

## 🚀 Features

- **Multi-Model Search**: Boolean, TF-IDF Vector, BM25, and Proximity Search
- **Real Dataset**: Uses actual CORD-19 research papers from Kaggle
- **Modern UI**: Built with Next.js and Tailwind CSS
- **RESTful API**: Python Flask backend with comprehensive endpoints
- **Real-time Search**: Sub-second query processing with detailed results
- **System Statistics**: Comprehensive analytics and performance metrics

## 🏗️ Architecture

```
cord19-web-app/
├── backend/                 # Python Flask API
│   ├── api/                # API route handlers
│   ├── models/             # Core IR system implementation
│   ├── utils/              # Utility functions
│   └── app.py              # Main Flask application
├── frontend/                # Next.js React application
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   └── components/     # React components
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🛠️ Technology Stack

### Backend
- **Python 3.8+**
- **Flask** - Web framework
- **NLTK** - Natural language processing
- **scikit-learn** - Machine learning and TF-IDF
- **NumPy** - Numerical computing

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **React Hooks** - State management

## 📋 Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Navigate to the project directory
cd "week 8/cord19-web-app"

# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Start the Backend

```bash
# From the backend directory
cd backend
python app.py
```

The Flask API will start on `http://localhost:5002`

### 3. Start the Frontend

```bash
# From the frontend directory (in a new terminal)
cd frontend
npm run dev
```

The Next.js app will start on `http://localhost:3000`

## 🔍 Search Methods

### 1. **Boolean Search**
- Exact term matching
- High precision results
- Fast execution (< 0.0001s)

### 2. **TF-IDF Vector Search**
- Semantic understanding
- Cosine similarity scoring
- Ranked results with relevance scores

### 3. **BM25 Search**
- Advanced probabilistic ranking
- Length normalization
- Optimal for medical literature

### 4. **Proximity Search**
- Contextual term relationships
- Configurable distance thresholds
- High precision for related terms

### 5. **Multi-Model Search**
- Compare all methods simultaneously
- Side-by-side result analysis
- Comprehensive search coverage

## 📊 API Endpoints

### Search Endpoints
- `POST /api/search/boolean` - Boolean search
- `POST /api/search/vector` - TF-IDF vector search
- `POST /api/search/bm25` - BM25 search
- `POST /api/search/proximity` - Proximity search
- `POST /api/search/multi` - Multi-model search

### Document Endpoints
- `GET /api/documents/` - List all documents
- `GET /api/documents/<id>` - Get document details
- `GET /api/documents/<id>/full` - Get full document content
- `GET /api/documents/<id>/terms` - Get document term statistics

### Statistics Endpoints
- `GET /api/stats/` - System overview
- `GET /api/stats/terms` - Term frequency statistics
- `GET /api/stats/documents` - Document statistics
- `GET /api/stats/performance` - Performance metrics
- `GET /api/stats/models` - Model information

## 🎯 Usage Examples

### Basic Search
```bash
# TF-IDF search for COVID treatment
curl -X POST http://localhost:5002/api/search/vector \
  -H "Content-Type: application/json" \
  -d '{"query": "covid treatment", "top_k": 5}'
```

### Proximity Search
```bash
# Find documents with "covid" and "treatment" within 5 words
curl -X POST http://localhost:5002/api/search/proximity \
  -H "Content-Type: application/json" \
  -d '{"term1": "covid", "term2": "treatment", "k": 5}'
```

### Multi-Model Search
```bash
# Compare all search methods
curl -X POST http://localhost:5002/api/search/multi \
  -H "Content-Type: application/json" \
  -d '{"query": "vaccine development", "top_k": 5}'
```

## 📈 Performance Characteristics

- **Index Construction**: Sub-second for 50 documents
- **Boolean Search**: 0.000066s - 0.000106s
- **Vector Search**: 0.000551s - 0.001366s
- **BM25 Search**: Sub-second processing
- **Memory Efficiency**: Optimized for medical literature

## 🔧 Configuration

### Backend Configuration
The system automatically detects and loads CORD-19 documents from the relative path:
```
/cord19_documents/
```

### Frontend Configuration
API base URL is configured in the frontend components:
```typescript
const API_BASE = 'http://localhost:5002';
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/  # If tests are implemented
```

### Frontend Testing
```bash
cd frontend
npm test
npm run build  # Build test
```

## 📚 Dataset Information

- **Source**: CORD-19 Research Challenge (Kaggle)
- **Content**: COVID-19 research papers
- **Format**: Structured text with metadata
- **Fields**: Title, Authors, Journal, Date, Abstract, Full Text
- **Topics**: Clinical, Epidemiological, Treatment, Public Health

## 🚀 Deployment

### Production Backend
```bash
cd backend
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Production Frontend
```bash
cd frontend
npm run build
npm start
```

### Docker Deployment
```bash
# Build and run with Docker Compose (if implemented)
docker-compose up -d
```

## 📄 License

This project is part of the Information Retrieval Lab coursework.
