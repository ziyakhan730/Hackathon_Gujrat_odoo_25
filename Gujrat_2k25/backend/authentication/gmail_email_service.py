import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from django.template.loader import render_to_string
from .models import EmailOTP

class GmailEmailService:
    """Email service using Gmail SMTP"""
    
    # Gmail SMTP settings
    SMTP_SERVER = 'smtp.gmail.com'
    SMTP_PORT = 587
    EMAIL = 'ziyakhanitm@gmail.com'
    PASSWORD = 'vgew epwa txso dedw'  # You'll need to generate this
    
    @staticmethod
    def send_email(to_email, subject, html_content, text_content=None):
        """Send email using Gmail SMTP"""
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f'QuickCourt <{GmailEmailService.EMAIL}>'
            msg['To'] = to_email
            
            # Attach both HTML and text versions
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(GmailEmailService.SMTP_SERVER, GmailEmailService.SMTP_PORT) as server:
                server.starttls()
                server.login(GmailEmailService.EMAIL, GmailEmailService.PASSWORD)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            print(f"Error sending email via Gmail: {e}")
            return False
    
    @staticmethod
    def send_otp_email(user, otp):
        """Send OTP email using Gmail"""
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
        
        return GmailEmailService.send_email(user.email, subject, html_content, text_content)
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email using Gmail"""
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
        
        return GmailEmailService.send_email(user.email, subject, html_content, text_content)
    
    @staticmethod
    def send_password_reset_email(user, reset_token):
        """Send password reset email using Gmail"""
        subject = 'Reset Your Password - QuickCourt'
        
        reset_url = f"http://localhost:8080/reset-password?token={reset_token}"
        
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
        
        return GmailEmailService.send_email(user.email, subject, html_content, text_content) 