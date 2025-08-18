from flask import Blueprint, request, jsonify
from models.cord19_ir_system import CORD19IRSystem

document_bp = Blueprint('documents', __name__)

# This will be set by the main app
ir_system = None

def init_document_routes(system):
    """Initialize the document routes with the IR system"""
    global ir_system
    ir_system = system

@document_bp.route('/', methods=['GET'])
def get_all_documents():
    """Get all documents with metadata"""
    try:
        documents = []
        for doc_id in ir_system.all_doc_ids:
            doc_info = ir_system.get_document_content(doc_id)
            if doc_info:
                documents.append({
                    'doc_id': doc_id,
                    'title': doc_info['metadata'].get('title', 'Unknown'),
                    'filename': doc_info['metadata'].get('filename', 'Unknown'),
                    'length': doc_info['length']
                })
        
        return jsonify({
            'total_documents': len(documents),
            'documents': documents
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@document_bp.route('/<doc_id>', methods=['GET'])
def get_document(doc_id):
    """Get specific document by ID"""
    try:
        doc_info = ir_system.get_document_content(doc_id)
        
        if not doc_info:
            return jsonify({'error': 'Document not found'}), 404
        
        return jsonify({
            'doc_id': doc_id,
            'metadata': doc_info['metadata'],
            'length': doc_info['length'],
            'preview': ' '.join(doc_info['tokens'][:100]) + '...' if len(doc_info['tokens']) > 100 else ' '.join(doc_info['tokens'])
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@document_bp.route('/<doc_id>/full', methods=['GET'])
def get_full_document(doc_id):
    """Get full document content"""
    try:
        doc_info = ir_system.get_document_content(doc_id)
        
        if not doc_info:
            return jsonify({'error': 'Document not found'}), 404
        
        return jsonify({
            'doc_id': doc_id,
            'metadata': doc_info['metadata'],
            'length': doc_info['length'],
            'tokens': doc_info['tokens']
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@document_bp.route('/<doc_id>/terms', methods=['GET'])
def get_document_terms(doc_id):
    """Get term frequency information for a document"""
    try:
        doc_info = ir_system.get_document_content(doc_id)
        
        if not doc_info:
            return jsonify({'error': 'Document not found'}), 404
        
        # Count term frequencies
        term_freq = {}
        for token in doc_info['tokens']:
            term_freq[token] = term_freq.get(token, 0) + 1
        
        # Sort by frequency
        sorted_terms = sorted(term_freq.items(), key=lambda x: x[1], reverse=True)
        
        return jsonify({
            'doc_id': doc_id,
            'title': doc_info['metadata'].get('title', 'Unknown'),
            'total_terms': len(doc_info['tokens']),
            'unique_terms': len(term_freq),
            'top_terms': sorted_terms[:20]  # Top 20 most frequent terms
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@document_bp.route('/search', methods=['GET'])
def search_documents():
    """Search documents by title or content"""
    try:
        query = request.args.get('q', '')
        limit = int(request.args.get('limit', 10))
        
        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400
        
        # Simple text search in titles and content
        results = []
        query_lower = query.lower()
        
        for doc_id in ir_system.all_doc_ids:
            doc_info = ir_system.get_document_content(doc_id)
            if doc_info:
                title = doc_info['metadata'].get('title', '').lower()
                content = ' '.join(doc_info['tokens']).lower()
                
                if query_lower in title or query_lower in content:
                    results.append({
                        'doc_id': doc_id,
                        'title': doc_info['metadata'].get('title', 'Unknown'),
                        'filename': doc_info['metadata'].get('filename', 'Unknown'),
                        'length': doc_info['length'],
                        'match_type': 'title' if query_lower in title else 'content'
                    })
                    
                    if len(results) >= limit:
                        break
        
        return jsonify({
            'query': query,
            'results_count': len(results),
            'limit': limit,
            'results': results
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
