import requests
import json
from django.conf import settings
from django.template.loader import render_to_string
from .models import EmailOTP

class BrevoEmailService:
    """Email service using Brevo API"""
    
    API_KEY = 'YOUR_BREVO_API_KEY'  # Replace with your Brevo API key
    API_URL = 'https://api.brevo.com/v3/smtp/email'
    
    @staticmethod
    def send_email(to_email, subject, html_content, text_content=None):
        """Send email using Brevo API"""
        headers = {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': BrevoEmailService.API_KEY
        }
        
        payload = {
            'sender': {
                'name': 'QuickCourt',
                'email': 'ziyakhanitm@gmail.com'
            },
            'to': [
                {
                    'email': to_email,
                    'name': to_email.split('@')[0]  # Use email prefix as name
                }
            ],
            'subject': subject,
            'htmlContent': html_content,
            'textContent': text_content or 'Please enable HTML to view this email.'
        }
        
        try:
            response = requests.post(
                BrevoEmailService.API_URL,
                headers=headers,
                data=json.dumps(payload)
            )
            
            if response.status_code == 201:
                return True
            else:
                print(f"Brevo API Error: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"Error sending email via Brevo API: {e}")
            return False
    
    @staticmethod
    def send_otp_email(user, otp):
        """Send OTP email using Brevo API"""
        subject = 'Verify Your Email - QuickCourt'
        
        # HTML template
        html_content = render_to_string('authentication/email/otp_verification.html', {
            'user': user,
            'otp': otp,
            'expires_in': '10 minutes'
        })
        
        # Plain text version
        text_content = f"""
        Hello {user.first_name},
        
        Your email verification code is: {otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        QuickCourt Team
        """
        
        return BrevoEmailService.send_email(user.email, subject, html_content, text_content)
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email using Brevo API"""
        subject = 'Welcome to QuickCourt!'
        
        html_content = render_to_string('authentication/email/welcome.html', {
            'user': user
        })
        
        text_content = f"""
        Welcome to QuickCourt, {user.first_name}!
        
        Thank you for joining India's fastest-growing sports community.
        
        You can now:
        - Book courts in your area
        - Join matches with other players
        - Manage your sports activities
        
        Get started by exploring courts near you!
        
        Best regards,
        QuickCourt Team
        """
        
        return BrevoEmailService.send_email(user.email, subject, html_content, text_content)
    
    @staticmethod
    def send_password_reset_email(user, reset_token):
        """Send password reset email using Brevo API"""
        subject = 'Reset Your Password - QuickCourt'
        
        reset_url = f"{getattr(settings, 'FRONTEND_URL', 'http://localhost:8080')}/reset-password?token={reset_token}"
        
        html_content = render_to_string('authentication/email/password_reset.html', {
            'user': user,
            'reset_url': reset_url
        })
        
        text_content = f"""
        Hello {user.first_name},
        
        You requested to reset your password. Click the link below to reset it:
        
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        QuickCourt Team
        """
        
        return BrevoEmailService.send_email(user.email, subject, html_content, text_content) 