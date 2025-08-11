#!/usr/bin/env python
"""
Reset user email verification status for testing
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

def reset_user_email_status():
    """Reset user email verification status for testing"""
    print("Resetting user email verification status...")
    print("-" * 50)
    
    try:
        # Get the test user
        test_user = User.objects.get(email='manansahni295@gmail.com')
        print(f"✅ Found test user: {test_user.email}")
        print(f"📧 Current email verified status: {test_user.is_email_verified}")
        
        # Reset email verification status
        test_user.is_email_verified = False
        test_user.save()
        print(f"✅ Reset email verification status to: {test_user.is_email_verified}")
        
        # Delete all existing OTPs for this user
        deleted_count = EmailOTP.objects.filter(user=test_user).delete()[0]
        print(f"✅ Deleted {deleted_count} existing OTPs")
        
        # Create a new OTP
        from authentication.email_service import EmailService
        email_otp = EmailService.create_otp(test_user, test_user.email)
        print(f"✅ Created new OTP: {email_otp.otp}")
        print(f"⏰ Expires at: {email_otp.expires_at}")
        
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
    reset_user_email_status() 