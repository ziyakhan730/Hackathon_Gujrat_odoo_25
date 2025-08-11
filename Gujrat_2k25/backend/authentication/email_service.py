import random
import string
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from datetime import timedelta
from .models import EmailOTP

class EmailService:
    """Service class for handling email operations"""
    
    @staticmethod
    def generate_otp(length=6):
        """Generate a random OTP"""
        return ''.join(random.choices(string.digits, k=length))
    
    @staticmethod
    def create_otp(user, email, expires_in_minutes=10):
        """Create and save an OTP for email verification"""
        # Invalidate any existing OTPs for this user
        EmailOTP.objects.filter(user=user, is_used=False).update(is_used=True)
        
        # Generate new OTP
        otp = EmailService.generate_otp()
        expires_at = timezone.now() + timedelta(minutes=expires_in_minutes)
        
        # Save OTP to database
        email_otp = EmailOTP.objects.create(
            user=user,
            email=email,
            otp=otp,
            expires_at=expires_at
        )
        
        return email_otp
    
    @staticmethod
    def send_otp_email(user, otp):
        """Send OTP email to user"""
        subject = 'Verify Your Email - QuickCourt'
        
        # HTML template for email
        html_message = render_to_string('authentication/email/otp_verification.html', {
            'user': user,
            'otp': otp,
            'expires_in': '10 minutes'
        })
        
        # Plain text version
        text_message = f"""
        Hello {user.first_name},
        
        Your email verification code is: {otp}
        
        This code will expire in 10 minutes.
        
        If you didn't request this code, please ignore this email.
        
        Best regards,
        QuickCourt Team
        """
        
        try:
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False
    
    @staticmethod
    def send_welcome_email(user):
        """Send welcome email to newly registered user"""
        subject = 'Welcome to QuickCourt!'
        
        html_message = render_to_string('authentication/email/welcome.html', {
            'user': user
        })
        
        text_message = f"""
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
        
        try:
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Error sending welcome email: {e}")
            return False
    
    @staticmethod
    def send_password_reset_email(user, reset_token):
        """Send password reset email"""
        subject = 'Reset Your Password - QuickCourt'
        
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        html_message = render_to_string('authentication/email/password_reset.html', {
            'user': user,
            'reset_url': reset_url
        })
        
        text_message = f"""
        Hello {user.first_name},
        
        You requested to reset your password. Click the link below to reset it:
        
        {reset_url}
        
        This link will expire in 1 hour.
        
        If you didn't request this, please ignore this email.
        
        Best regards,
        QuickCourt Team
        """
        
        try:
            send_mail(
                subject=subject,
                message=text_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"Error sending password reset email: {e}")
            return False
    
    @staticmethod
    def verify_otp(user, otp):
        """Verify OTP and mark email as verified"""
        try:
            email_otp = EmailOTP.objects.get(
                user=user,
                otp=otp,
                is_used=False
            )
            
            if email_otp.is_valid():
                # Mark OTP as used
                email_otp.is_used = True
                email_otp.save()
                
                # Mark user email as verified
                user.is_email_verified = True
                user.save()
                
                return True, "Email verified successfully"
            else:
                if email_otp.is_expired():
                    return False, "OTP has expired"
                else:
                    return False, "Invalid OTP"
                    
        except EmailOTP.DoesNotExist:
            return False, "Invalid OTP"
    
    @staticmethod
    def resend_otp(user):
        """Resend OTP to user"""
        # Create new OTP
        email_otp = EmailService.create_otp(user, user.email)
        
        # Send email
        if EmailService.send_otp_email(user, email_otp.otp):
            return True, "OTP sent successfully"
        else:
            return False, "Failed to send OTP" 