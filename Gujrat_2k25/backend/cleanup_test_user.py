#!/usr/bin/env python
"""
Clean up test user for fresh testing
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User, EmailOTP

def cleanup_test_user():
    """Clean up test user for fresh testing"""
    print("Cleaning up test user...")
    print("-" * 50)
    
    try:
        # Find and delete the test user
        test_user = User.objects.filter(email='manansahni295@gmail.com').first()
        
        if test_user:
            print(f"✅ Found test user: {test_user.email}")
            print(f"📧 Email verified: {test_user.is_email_verified}")
            
            # Delete all OTPs for this user
            otp_count = EmailOTP.objects.filter(user=test_user).count()
            EmailOTP.objects.filter(user=test_user).delete()
            print(f"✅ Deleted {otp_count} OTPs")
            
            # Delete the user
            test_user.delete()
            print(f"✅ Deleted test user")
            
        else:
            print("ℹ️ Test user not found - ready for fresh registration")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    cleanup_test_user() 