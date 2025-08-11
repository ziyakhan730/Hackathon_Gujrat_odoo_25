#!/usr/bin/env python
"""
Test script to verify OTP verification functionality
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.email_service import EmailService
from authentication.models import User, EmailOTP

def test_otp_verification():
    """Test OTP verification functionality"""
    print("Testing OTP verification functionality...")
    print("-" * 50)
    
    try:
        # Get the test user
        test_user = User.objects.get(email='ziyakhanitm@gmail.com')
        print(f"✅ Using test user: {test_user.email}")
        print(f"📧 Email verified: {test_user.is_email_verified}")
        
        # Get the latest OTP for this user
        latest_otp = EmailOTP.objects.filter(user=test_user, is_used=False).order_by('-created_at').first()
        
        if latest_otp:
            print(f"🔢 Found OTP: {latest_otp.otp}")
            print(f"⏰ Expires at: {latest_otp.expires_at}")
            print(f"✅ Is valid: {latest_otp.is_valid()}")
            
            # Test verification
            print("\nTesting OTP verification...")
            success, message = EmailService.verify_otp(test_user, latest_otp.otp)
            
            if success:
                print(f"✅ OTP verification successful: {message}")
                # Refresh user data
                test_user.refresh_from_db()
                print(f"📧 Email verified status: {test_user.is_email_verified}")
            else:
                print(f"❌ OTP verification failed: {message}")
                
        else:
            print("❌ No valid OTP found for user")
            
    except Exception as e:
        print(f"❌ Error testing OTP verification: {e}")

def test_invalid_otp():
    """Test invalid OTP handling"""
    print("\nTesting invalid OTP handling...")
    print("-" * 50)
    
    try:
        # Get the test user
        test_user = User.objects.get(email='ziyakhanitm@gmail.com')
        
        # Test with invalid OTP
        success, message = EmailService.verify_otp(test_user, '000000')
        
        if not success:
            print(f"✅ Invalid OTP correctly rejected: {message}")
        else:
            print(f"❌ Invalid OTP was accepted (this is wrong)")
            
    except Exception as e:
        print(f"❌ Error testing invalid OTP: {e}")

if __name__ == '__main__':
    test_otp_verification()
    test_invalid_otp() 