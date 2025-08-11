#!/usr/bin/env python
"""
Test the complete verification flow
"""
import os
import sys
import django
import requests
import json

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User, EmailOTP
from authentication.email_service import EmailService
from rest_framework_simplejwt.tokens import RefreshToken

def test_complete_verification_flow():
    """Test the complete verification flow"""
    print("Testing complete verification flow...")
    print("-" * 50)
    
    try:
        # Get the test user
        test_user = User.objects.get(email='manansahni295@gmail.com')
        print(f"✅ Found test user: {test_user.email}")
        
        # Generate JWT tokens (like in registration)
        refresh = RefreshToken.for_user(test_user)
        access_token = refresh.access_token
        
        print(f"✅ Generated access token: {str(access_token)[:50]}...")
        print(f"✅ Generated refresh token: {str(refresh)[:50]}...")
        
        # Get the latest OTP
        latest_otp = EmailOTP.objects.filter(user=test_user, is_used=False).order_by('-created_at').first()
        
        if latest_otp:
            print(f"✅ Found OTP: {latest_otp.otp}")
            
            # Test the verification endpoint with the token
            url = 'http://localhost:8000/api/auth/verify-email/'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {str(access_token)}',
            }
            data = {
                'otp': latest_otp.otp
            }
            
            print(f"\nTesting API endpoint: {url}")
            print(f"Headers: {headers}")
            print(f"Data: {data}")
            
            response = requests.post(url, headers=headers, json=data)
            
            print(f"Response status: {response.status_code}")
            print(f"Response data: {response.json()}")
            
            if response.status_code == 200:
                print("✅ Verification successful!")
                test_user.refresh_from_db()
                print(f"📧 Email verified status: {test_user.is_email_verified}")
            else:
                print("❌ Verification failed")
                
        else:
            print("❌ No valid OTP found for user")
            
    except User.DoesNotExist:
        print("❌ Test user not found")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_token_validation():
    """Test token validation"""
    print("\nTesting token validation...")
    print("-" * 50)
    
    try:
        # Get the test user
        test_user = User.objects.get(email='manansahni295@gmail.com')
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(test_user)
        access_token = refresh.access_token
        
        # Test the profile endpoint to verify token works
        url = 'http://localhost:8000/api/auth/profile/'
        headers = {
            'Authorization': f'Bearer {str(access_token)}',
            'Content-Type': 'application/json',
        }
        
        print(f"Testing profile endpoint with token...")
        response = requests.get(url, headers=headers)
        
        print(f"Profile response status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Token is valid and user is authenticated")
            print(f"Profile data: {response.json()}")
        else:
            print("❌ Token validation failed")
            print(f"Error: {response.text}")
            
    except User.DoesNotExist:
        print("❌ Test user not found")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    test_token_validation()
    test_complete_verification_flow() 