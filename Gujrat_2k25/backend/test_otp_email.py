#!/usr/bin/env python
"""
Test script to verify OTP email functionality
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
from authentication.models import User

def test_otp_email():
    """Test OTP email functionality"""
    print("Testing OTP email functionality...")
    print("-" * 50)
    
    try:
        # Create a test user
        test_user, created = User.objects.get_or_create(
            email='ziyakhanitm@gmail.com',
            defaults={
                'first_name': 'Ziya',
                'last_name': 'Khan',
                'username': 'ziyakhan',
                'user_type': 'player',
                'is_email_verified': False
            }
        )
        
        if created:
            print(f"✅ Created test user: {test_user.email}")
        else:
            print(f"✅ Using existing user: {test_user.email}")
        
        # Create and send OTP
        print("Creating OTP...")
        email_otp = EmailService.create_otp(test_user, test_user.email)
        print(f"✅ OTP created: {email_otp.otp}")
        
        # Send OTP email
        print("Sending OTP email...")
        success = EmailService.send_otp_email(test_user, email_otp.otp)
        
        if success:
            print("✅ OTP email sent successfully!")
            print(f"📧 Check your inbox at {test_user.email}")
            print(f"🔢 OTP Code: {email_otp.otp}")
            print(f"⏰ Expires at: {email_otp.expires_at}")
        else:
            print("❌ Failed to send OTP email")
            
    except Exception as e:
        print(f"❌ Error testing OTP email: {e}")

def test_welcome_email():
    """Test welcome email functionality"""
    print("\nTesting welcome email functionality...")
    print("-" * 50)
    
    try:
        # Get the test user
        test_user = User.objects.get(email='ziyakhanitm@gmail.com')
        
        # Send welcome email
        print("Sending welcome email...")
        success = EmailService.send_welcome_email(test_user)
        
        if success:
            print("✅ Welcome email sent successfully!")
            print(f"📧 Check your inbox at {test_user.email}")
        else:
            print("❌ Failed to send welcome email")
            
    except Exception as e:
        print(f"❌ Error testing welcome email: {e}")

if __name__ == '__main__':
    test_otp_email()
    test_welcome_email() 