#!/usr/bin/env python
"""
Debug script to test email verification endpoint
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

def test_verification_endpoint():
    """Test the verification endpoint directly"""
    print("Testing email verification endpoint...")
    print("-" * 50)
    
    try:
        # Get the test user
        test_user = User.objects.get(email='manansahni295@gmail.com')
        print(f"✅ Found test user: {test_user.email}")
        print(f"📧 Email verified: {test_user.is_email_verified}")
        
        # Get the latest OTP
        latest_otp = EmailOTP.objects.filter(user=test_user, is_used=False).order_by('-created_at').first()
        
        if latest_otp:
            print(f"🔢 Found OTP: {latest_otp.otp}")
            print(f"⏰ Expires at: {latest_otp.expires_at}")
            print(f"✅ Is valid: {latest_otp.is_valid()}")
            
            # Test the verification endpoint
            url = 'http://localhost:8000/api/auth/verify-email/'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TEMP_TOKEN_HERE'  # You'll need to replace this
            }
            data = {
                'otp': latest_otp.otp
            }
            
            print(f"\nTesting API endpoint: {url}")
            print(f"Headers: {headers}")
            print(f"Data: {data}")
            
            # Note: You'll need to replace YOUR_TEMP_TOKEN_HERE with the actual temp token
            # from the frontend localStorage
            
        else:
            print("❌ No valid OTP found for user")
            
    except User.DoesNotExist:
        print("❌ Test user not found")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_email_service_directly():
    """Test the EmailService.verify_otp method directly"""
    print("\nTesting EmailService.verify_otp directly...")
    print("-" * 50)
    
    try:
        # Get the test user
        test_user = User.objects.get(email='manansahni295@gmail.com')
        print(f"✅ Found test user: {test_user.email}")
        
        # Get the latest OTP
        latest_otp = EmailOTP.objects.filter(user=test_user, is_used=False).order_by('-created_at').first()
        
        if latest_otp:
            print(f"🔢 Found OTP: {latest_otp.otp}")
            
            # Test verification directly
            success, message = EmailService.verify_otp(test_user, latest_otp.otp)
            
            if success:
                print(f"✅ EmailService verification successful: {message}")
                test_user.refresh_from_db()
                print(f"📧 Email verified status: {test_user.is_email_verified}")
            else:
                print(f"❌ EmailService verification failed: {message}")
                
        else:
            print("❌ No valid OTP found for user")
            
    except User.DoesNotExist:
        print("❌ Test user not found")
    except Exception as e:
        print(f"❌ Error: {e}")

def check_user_otps():
    """Check all OTPs for the user"""
    print("\nChecking all OTPs for user...")
    print("-" * 50)
    
    try:
        test_user = User.objects.get(email='manansahni295@gmail.com')
        otps = EmailOTP.objects.filter(user=test_user).order_by('-created_at')
        
        print(f"Found {otps.count()} OTPs for user:")
        for otp in otps:
            print(f"  - OTP: {otp.otp}, Used: {otp.is_used}, Valid: {otp.is_valid()}, Expires: {otp.expires_at}")
            
    except User.DoesNotExist:
        print("❌ Test user not found")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    check_user_otps()
    test_email_service_directly()
    test_verification_endpoint() 