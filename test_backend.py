#!/usr/bin/env python3
"""
Simple test script for the CORD-19 IR System backend
Run this to verify the backend is working correctly
"""

import requests
import json
import time

BASE_URL = "http://localhost:5002"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['message']}")
            print(f"   Documents loaded: {data['documents_loaded']}")
            return True
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running?")
        return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_api_info():
    """Test the API info endpoint"""
    print("\n🔍 Testing API info...")
    try:
        response = requests.get(f"{BASE_URL}/api")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ API info retrieved: {data['name']}")
            print(f"   Version: {data['version']}")
            print(f"   Models: {', '.join(data['models'])}")
            return True
        else:
            print(f"❌ API info failed with status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API info error: {e}")
        return False

def test_search_endpoints():
    """Test the search endpoints"""
    print("\n🔍 Testing search endpoints...")
    
    # Test vector search
    print("   Testing TF-IDF vector search...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/search/vector",
            json={"query": "covid treatment", "top_k": 3}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Vector search: {data['results_count']} results in {data['processing_time']}")
        else:
            print(f"   ❌ Vector search failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Vector search error: {e}")
    
    # Test boolean search
    print("   Testing boolean search...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/search/boolean",
            json={"query": "covid"}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Boolean search: {data['results_count']} results in {data['processing_time']}")
        else:
            print(f"   ❌ Boolean search failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Boolean search error: {e}")
    
    # Test BM25 search
    print("   Testing BM25 search...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/search/bm25",
            json={"query": "vaccine development", "top_k": 3}
        )
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ BM25 search: {data['results_count']} results in {data['processing_time']}")
        else:
            print(f"   ❌ BM25 search failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ BM25 search error: {e}")

def test_stats_endpoints():
    """Test the statistics endpoints"""
    print("\n🔍 Testing statistics endpoints...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/stats/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ System stats: {data['total_documents']} documents, {data['total_terms']} terms")
        else:
            print(f"❌ System stats failed: {response.status_code}")
    except Exception as e:
        print(f"❌ System stats error: {e}")

def main():
    """Main test function"""
    print("🚀 CORD-19 IR System Backend Test")
    print("=" * 50)
    
    # Wait a moment for backend to be ready
    print("⏳ Waiting for backend to be ready...")
    time.sleep(2)
    
    # Run tests
    tests = [
        test_health_check,
        test_api_info,
        test_search_endpoints,
        test_stats_endpoints
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working correctly.")
        print("\n🌐 You can now:")
        print("   • Open http://localhost:3000 in your browser for the frontend")
        print("   • Use the API at http://localhost:5000")
        print("   • Run searches and view statistics")
    else:
        print("❌ Some tests failed. Check the backend logs for errors.")
    
    print("\n" + "=" * 50)

if __name__ == "__main__":
    main()
