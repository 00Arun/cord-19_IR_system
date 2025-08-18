import os
import re
import math
import nltk
from collections import defaultdict
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer, WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Download NLTK resources
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

class CORD19IRSystem:
    """
    Advanced CORD-19 Information Retrieval System
    Implements multiple retrieval models: Boolean, TF-IDF, BM25, and Proximity Search
    """
    
    def __init__(self):
        """Initialize the CORD-19 IR system"""
        self.documents = {}
        self.inverted_index = {}
        self.positional_index = {}
        self.metadata = {}
        self.doc_lengths = {}
        self.avg_doc_length = 0
        self.N = 0  # Total number of documents
        
        # Text processing components
        self.stop_words = set(stopwords.words('english'))
        self.stemmer = PorterStemmer()
        self.lemmatizer = WordNetLemmatizer()
        
        # CORD-19 specific stop words
        cord19_stop_words = {
            'covid', 'coronavirus', 'sars', 'cov', 'virus', 'viral',
            'infection', 'infectious', 'disease', 'pandemic', 'epidemic',
            'patient', 'patients', 'clinical', 'study', 'research',
            'paper', 'article', 'journal', 'doi', 'pmid', 'pmcid',
            'abstract', 'background', 'methods', 'results', 'conclusion',
            'introduction', 'discussion', 'materials', 'data'
        }
        self.stop_words.update(cord19_stop_words)
        
        # TF-IDF components
        self.tfidf_vectorizer = None
        self.tfidf_matrix = None
        self.feature_names = []

    def preprocess_text(self, text):
        """Advanced text preprocessing pipeline for CORD-19 research papers"""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters but keep important medical terms
        text = re.sub(r'[^\w\s\-]', ' ', text)
        
        # Remove numbers but keep important medical codes
        text = re.sub(r'\b\d{1,2}\.\d+\b', '', text)
        text = re.sub(r'\b\d{4,}\b', '', text)
        
        # Tokenize and apply multi-stage normalization
        tokens = nltk.word_tokenize(text)
        processed_tokens = []
        
        for token in tokens:
            if len(token) < 2 or token.isdigit() or token in self.stop_words:
                continue
                
            # Stem and lemmatize
            stemmed = self.stemmer.stem(token)
            lemmatized = self.lemmatizer.lemmatize(stemmed)
            
            if len(lemmatized) > 2:
                processed_tokens.append(lemmatized)
        
        return processed_tokens

    def load_documents(self, directory="cord19_documents"):
        """Load and preprocess CORD-19 research documents"""
        print(f"Loading documents from {directory}...")
        
        if not os.path.exists(directory):
            print(f"Directory {directory} not found. Creating sample documents...")
            self.create_sample_documents(directory)
        
        doc_counter = 1
        for filename in sorted(os.listdir(directory)):
            if filename.endswith('.txt'):
                doc_id = filename.split('.')[0]
                
                with open(os.path.join(directory, filename), 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Preprocess the content
                tokens = self.preprocess_text(content)
                
                # Store document
                self.documents[doc_id] = tokens
                self.doc_lengths[doc_id] = len(tokens)
                
                # Extract metadata (first line as title)
                lines = content.split('\n')
                title = lines[0] if lines else "Unknown Title"
                self.metadata[doc_id] = {
                    'title': title,
                    'filename': filename,
                    'length': len(tokens)
                }
                
                doc_counter += 1
        
        self.N = len(self.documents)
        if self.N > 0:
            # Ensure all values are scalars, not numpy arrays
            doc_length_values = [int(length) if hasattr(length, '__len__') else length for length in self.doc_lengths.values()]
            self.avg_doc_length = sum(doc_length_values) / self.N
        
        print(f"Loaded {self.N} documents")
        self.build_indexes()

    def create_sample_documents(self, directory="sample_documents"):
        """Create sample CORD-19 documents for testing"""
        os.makedirs(directory, exist_ok=True)
        
        sample_docs = [
            {
                'id': 'cord19_001',
                'title': 'COVID-19 Clinical Characteristics and Treatment Protocols',
                'content': 'This study examines the clinical characteristics of COVID-19 patients and evaluates various treatment protocols including antiviral medications and supportive care measures.'
            },
            {
                'id': 'cord19_002',
                'title': 'Vaccine Development and Efficacy Studies',
                'content': 'Research on COVID-19 vaccine development focusing on mRNA technology and clinical trial results showing efficacy and safety profiles.'
            },
            {
                'id': 'cord19_003',
                'title': 'Epidemiological Analysis of COVID-19 Spread',
                'content': 'Epidemiological study analyzing the transmission patterns and factors influencing COVID-19 spread across different populations and regions.'
            }
        ]
        
        for doc in sample_docs:
            filename = f"{doc['id']}.txt"
            filepath = os.path.join(directory, filename)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(f"{doc['title']}\n\n{doc['content']}")
        
        print(f"Created {len(sample_docs)} sample documents in {directory}")

    def build_indexes(self):
        """Build all indexing structures"""
        print("Building indexes...")
        
        # Build inverted index
        for doc_id, tokens in self.documents.items():
            for position, token in enumerate(tokens):
                if token not in self.inverted_index:
                    self.inverted_index[token] = []
                if doc_id not in self.inverted_index[token]:
                    self.inverted_index[token].append(doc_id)
                
                # Build positional index
                if token not in self.positional_index:
                    self.positional_index[token] = {}
                if doc_id not in self.positional_index[token]:
                    self.positional_index[token][doc_id] = []
                self.positional_index[token][doc_id].append(position)
        
        # Build TF-IDF matrix
        self._build_tfidf_matrix()
        
        print(f"Indexes built: {len(self.inverted_index)} unique terms")

    def _build_tfidf_matrix(self):
        """Build TF-IDF matrix for vector search"""
        if not self.documents:
            return
        
        # Prepare documents for TF-IDF
        doc_texts = []
        for doc_id in sorted(self.documents.keys()):
            doc_text = ' '.join(self.documents[doc_id])
            doc_texts.append(doc_text)
        
        # Create TF-IDF vectorizer
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95
        )
        
        # Fit and transform
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(doc_texts)
        self.feature_names = self.tfidf_vectorizer.get_feature_names_out()
        
        # Ensure feature_names is a list, not a numpy array
        if hasattr(self.feature_names, 'tolist'):
            self.feature_names = self.feature_names.tolist()
        
        print(f"TF-IDF matrix built with {len(self.feature_names)} features")

    def boolean_search(self, query):
        """Perform Boolean search on CORD-19 documents"""
        tokens = self.preprocess_text(query)
        results = set(self.all_doc_ids)
        
        for token in tokens:
            if token in self.inverted_index:
                token_docs = set(self.inverted_index[token])
                results = results.intersection(token_docs)
            else:
                results = set()
                break
        
        return list(results)

    def vector_search(self, query, top_k=5):
        """Perform vector-based search using TF-IDF and cosine similarity"""
        if self.tfidf_matrix is None:
            return []
        
        query_tokens = self.preprocess_text(query)
        query_text = ' '.join(query_tokens)
        
        # Transform query and calculate similarities
        query_vector = self.tfidf_vectorizer.transform([query_text])
        similarities = cosine_similarity(query_vector, self.tfidf_matrix).flatten()
        
        # Get top-k results
        top_indices = similarities.argsort()[-top_k:][::-1]
        
        results = []
        for idx in top_indices:
            if similarities[idx] > 0:
                doc_id = list(self.documents.keys())[idx]
                results.append({
                    'doc_id': doc_id,
                    'score': float(similarities[idx]),
                    'title': self.metadata.get(doc_id, {}).get('title', 'Unknown')
                })
        
        return results

    def bm25_search(self, query, top_k=5):
        """Perform BM25 search with ranking"""
        query_terms = self.preprocess_text(query)
        
        if not query_terms:
            return []
        
        # Calculate BM25 scores for all documents
        scores = []
        for doc_id in self.documents.keys():
            score = self.okapi_bm25(query, doc_id)
            if score > 0:
                scores.append({
                    'doc_id': doc_id,
                    'score': score,
                    'title': self.metadata.get(doc_id, {}).get('title', 'Unknown')
                })
        
        # Sort by score and return top-k
        scores.sort(key=lambda x: x['score'], reverse=True)
        return scores[:top_k]

    def okapi_bm25(self, query, doc_id, k1=1.5, b=0.75):
        """Okapi BM25 scoring function"""
        query_terms = self.preprocess_text(query)
        doc_length = self.doc_lengths[doc_id]
        score = 0.0
        
        for term in query_terms:
            tf = self.get_term_frequency(term, doc_id)
            df = self.get_document_frequency(term)
            
            # IDF component (RSJ version)
            idf = max(math.log((self.N - df + 0.5) / (df + 0.5)), 0)
            
            # TF component with length normalization
            numerator = tf * (k1 + 1)
            denominator = tf + k1 * (1 - b + b * (doc_length / self.avg_doc_length))
            
            score += idf * (numerator / denominator) if denominator > 0 else 0
        
        return score

    def proximity_search(self, term1, term2, k=5):
        """Find documents where terms appear within k words of each other"""
        results = []
        
        # Get documents containing both terms
        docs_term1 = set(self.positional_index.get(term1, {}).keys())
        docs_term2 = set(self.positional_index.get(term2, {}).keys())
        common_docs = docs_term1 & docs_term2
        
        for doc_id in common_docs:
            positions1 = self.positional_index[term1][doc_id]
            positions2 = self.positional_index[term2][doc_id]
            
            # Check positions for proximity
            for pos1 in positions1:
                for pos2 in positions2:
                    if abs(pos1 - pos2) <= k:
                        results.append({
                            'doc_id': doc_id,
                            'title': self.metadata.get(doc_id, {}).get('title', 'Unknown'),
                            'distance': abs(pos1 - pos2)
                        })
                        break
                if any(r['doc_id'] == doc_id for r in results):
                    break
        
        return results

    def get_term_frequency(self, term, doc_id):
        """Get term frequency in a document"""
        if doc_id in self.documents and term in self.documents[doc_id]:
            return self.documents[doc_id].count(term)
        return 0

    def get_document_frequency(self, term):
        """Get document frequency of a term"""
        return len(self.inverted_index.get(term, []))

    @property
    def all_doc_ids(self):
        """Get all document IDs"""
        return list(self.documents.keys())

    def get_document_content(self, doc_id):
        """Get document content and metadata"""
        if doc_id not in self.documents:
            return None
        
        return {
            'doc_id': doc_id,
            'metadata': self.metadata.get(doc_id, {}),
            'tokens': self.documents[doc_id],
            'length': self.doc_lengths.get(doc_id, 0)
        }

    def get_system_stats(self):
        """Get system statistics"""
        return {
            'total_documents': int(self.N) if self.N is not None else 0,
            'total_terms': len(self.inverted_index) if self.inverted_index else 0,
            'avg_document_length': float(self.avg_doc_length) if self.avg_doc_length is not None else 0.0,
            'tfidf_features': len(self.feature_names) if self.feature_names else 0
        }
