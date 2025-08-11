#!/usr/bin/env python
"""
Create a new OTP for testing
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from authentication.models import User
from authentication.email_service import EmailService

def create_test_otp():
    """Create a new OTP for testing"""
    print("Creating new OTP for testing...")
    print("-" * 50)
    
    try:
        # Get the test user
        test_user = User.objects.get(email='manansahni295@gmail.com')
        print(f"✅ Found test user: {test_user.email}")
        
        # Create new OTP
        email_otp = EmailService.create_otp(test_user, test_user.email)
        print(f"✅ Created new OTP: {email_otp.otp}")
        print(f"⏰ Expires at: {email_otp.expires_at}")
        print(f"✅ Is valid: {email_otp.is_valid()}")
        
        # Send email
        success = EmailService.send_otp_email(test_user, email_otp.otp)
        if success:
            print("✅ OTP email sent successfully!")
            print(f"📧 Check your inbox at {test_user.email}")
        else:
            print("❌ Failed to send OTP email")
            
    except User.DoesNotExist:
        print("❌ Test user not found")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == '__main__':
    create_test_otp() 