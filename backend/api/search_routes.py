from flask import Blueprint, request, jsonify
from models.cord19_ir_system import CORD19IRSystem
import time

search_bp = Blueprint('search', __name__)

# This will be set by the main app
ir_system = None

def init_search_routes(system):
    """Initialize the search routes with the IR system"""
    global ir_system
    ir_system = system

@search_bp.route('/boolean', methods=['POST'])
def boolean_search():
    """Boolean search endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        start_time = time.time()
        results = ir_system.boolean_search(query)
        processing_time = time.time() - start_time
        
        # Get metadata for results
        detailed_results = []
        for doc_id in results:
            doc_info = ir_system.get_document_content(doc_id)
            if doc_info:
                detailed_results.append({
                    'doc_id': doc_id,
                    'title': doc_info['metadata'].get('title', 'Unknown'),
                    'filename': doc_info['metadata'].get('filename', 'Unknown'),
                    'length': doc_info['length']
                })
        
        return jsonify({
            'query': query,
            'method': 'Boolean Search',
            'results_count': len(results),
            'processing_time': f"{processing_time:.6f}s",
            'results': detailed_results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/vector', methods=['POST'])
def vector_search():
    """TF-IDF vector search endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        top_k = data.get('top_k', 5)
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        start_time = time.time()
        results = ir_system.vector_search(query, top_k)
        processing_time = time.time() - start_time
        
        return jsonify({
            'query': query,
            'method': 'TF-IDF Vector Search',
            'results_count': len(results),
            'processing_time': f"{processing_time:.6f}s",
            'top_k': top_k,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/bm25', methods=['POST'])
def bm25_search():
    """BM25 search endpoint"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        top_k = data.get('top_k', 5)
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        start_time = time.time()
        results = ir_system.bm25_search(query, top_k)
        processing_time = time.time() - start_time
        
        return jsonify({
            'query': query,
            'method': 'BM25 Search',
            'results_count': len(results),
            'processing_time': f"{processing_time:.6f}s",
            'top_k': top_k,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/proximity', methods=['POST'])
def proximity_search():
    """Proximity search endpoint"""
    try:
        data = request.get_json()
        term1 = data.get('term1', '')
        term2 = data.get('term2', '')
        k = data.get('k', 5)
        
        if not term1 or not term2:
            return jsonify({'error': 'Both term1 and term2 are required'}), 400
        
        start_time = time.time()
        results = ir_system.proximity_search(term1, term2, k)
        processing_time = time.time() - start_time
        
        return jsonify({
            'term1': term1,
            'term2': term2,
            'method': 'Proximity Search',
            'proximity_threshold': k,
            'results_count': len(results),
            'processing_time': f"{processing_time:.6f}s",
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@search_bp.route('/multi', methods=['POST'])
def multi_model_search():
    """Multi-model search endpoint - returns results from all models"""
    try:
        data = request.get_json()
        query = data.get('query', '')
        top_k = data.get('top_k', 5)
        
        if not query:
            return jsonify({'error': 'Query is required'}), 400
        
        results = {}
        
        # Boolean search
        start_time = time.time()
        boolean_results = ir_system.boolean_search(query)
        boolean_time = time.time() - start_time
        results['boolean'] = {
            'results_count': len(boolean_results),
            'processing_time': f"{boolean_time:.6f}s",
            'results': boolean_results
        }
        
        # Vector search
        start_time = time.time()
        vector_results = ir_system.vector_search(query, top_k)
        vector_time = time.time() - start_time
        results['vector'] = {
            'results_count': len(vector_results),
            'processing_time': f"{vector_time:.6f}s",
            'results': vector_results
        }
        
        # BM25 search
        start_time = time.time()
        bm25_results = ir_system.bm25_search(query, top_k)
        bm25_time = time.time() - start_time
        results['bm25'] = {
            'results_count': len(bm25_results),
            'processing_time': f"{bm25_time:.6f}s",
            'results': bm25_results
        }
        
        return jsonify({
            'query': query,
            'method': 'Multi-Model Search',
            'top_k': top_k,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
