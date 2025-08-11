#!/usr/bin/env python
"""
Test script to verify email configuration with Brevo SMTP
"""
import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

def test_email_configuration():
    """Test the email configuration"""
    print("Testing email configuration...")
    print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
    print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
    print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
    print(f"DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")
    print("-" * 50)
    
    try:
        # Send a test email
        subject = 'QuickCourt - Email Configuration Test'
        message = """
        Hello!
        
        This is a test email to verify that your QuickCourt email configuration is working correctly.
        
        If you receive this email, it means:
        ✅ SMTP settings are correct
        ✅ Brevo integration is working
        ✅ Email service is ready for production
        
        Best regards,
        QuickCourt Team
        """
        
        # Send to your email
        recipient_list = ['ziyakhanitm@gmail.com']
        
        print(f"Sending test email to: {recipient_list}")
        
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        print("✅ Test email sent successfully!")
        print("Check your inbox at ziyakhanitm@gmail.com")
        
    except Exception as e:
        print(f"❌ Error sending test email: {e}")
        print("Please check your SMTP configuration.")

if __name__ == '__main__':
    test_email_configuration() 