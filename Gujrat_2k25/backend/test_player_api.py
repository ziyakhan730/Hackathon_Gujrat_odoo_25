#!/usr/bin/env python
"""
Test script for Player API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_player_dashboard():
    """Test the player dashboard endpoint"""
    print("Testing Player Dashboard API...")
    
    # First, we need to get a token (this would normally come from login)
    # For now, let's just test if the endpoint exists
    url = f"{BASE_URL}/courts/player/dashboard/"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 401:
            print("✅ Endpoint exists but requires authentication (expected)")
        elif response.status_code == 200:
            print("✅ Endpoint working!")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_player_bookings():
    """Test the player bookings endpoint"""
    print("\nTesting Player Bookings API...")
    
    url = f"{BASE_URL}/courts/player/bookings/"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 401:
            print("✅ Endpoint exists but requires authentication (expected)")
        elif response.status_code == 200:
            print("✅ Endpoint working!")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_player_venues():
    """Test the player venues endpoint"""
    print("\nTesting Player Venues API...")
    
    url = f"{BASE_URL}/courts/player/venues/"
    
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")
        
        if response.status_code == 401:
            print("✅ Endpoint exists but requires authentication (expected)")
        elif response.status_code == 200:
            print("✅ Endpoint working!")
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_existing_endpoints():
    """Test some existing endpoints to make sure the server is working"""
    print("\nTesting Existing Endpoints...")
    
    # Test sports endpoint (should be public)
    url = f"{BASE_URL}/courts/sports/"
    
    try:
        response = requests.get(url)
        print(f"Sports API Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Sports API working!")
        else:
            print(f"❌ Sports API failed: {response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure Django server is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 Testing Player API Endpoints")
    print("=" * 50)
    
    test_existing_endpoints()
    test_player_dashboard()
    test_player_bookings()
    test_player_venues()
    
    print("\n" + "=" * 50)
    print("✅ Testing completed!") 