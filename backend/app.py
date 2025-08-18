from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from models.cord19_ir_system import CORD19IRSystem
from api.search_routes import search_bp
from api.document_routes import document_bp
from api.stats_routes import stats_bp

app = Flask(__name__)
CORS(app)

# Initialize the CORD-19 IR system
ir_system = CORD19IRSystem()

# Load documents on startup
def initialize_system():
    """Initialize the IR system with CORD-19 documents"""
    try:
        # Get the path to cord19_documents relative to this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        cord19_path = os.path.join(current_dir, '..', 'cord19_documents')
        
        if os.path.exists(cord19_path):
            ir_system.load_documents(cord19_path)
            print(f"Successfully loaded documents from {cord19_path}")
        else:
            print(f"Warning: CORD-19 documents not found at {cord19_path}")
            # Create sample documents if the real ones aren't available
            ir_system.create_sample_documents()
    except Exception as e:
        print(f"Error initializing system: {e}")

# Initialize the system
initialize_system()

# Initialize routes with the IR system
from api.search_routes import init_search_routes
from api.document_routes import init_document_routes
from api.stats_routes import init_stats_routes

# Register blueprints
app.register_blueprint(search_bp, url_prefix='/api/search')
app.register_blueprint(document_bp, url_prefix='/api/documents')
app.register_blueprint(stats_bp, url_prefix='/api/stats')

# Initialize all routes with the IR system
init_search_routes(ir_system)
init_document_routes(ir_system)
init_stats_routes(ir_system)

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'CORD-19 IR System is running',
        'documents_loaded': len(ir_system.documents) if hasattr(ir_system, 'documents') else 0
    })

@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'name': 'CORD-19 Information Retrieval System API',
        'version': '1.0.0',
        'description': 'Advanced multi-model search and ranking platform for COVID-19 research papers',
        'endpoints': {
            'search': '/api/search',
            'documents': '/api/documents',
            'statistics': '/api/stats',
            'health': '/api/health'
        },
        'models': ['Boolean', 'TF-IDF', 'BM25', 'Proximity Search']
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)
