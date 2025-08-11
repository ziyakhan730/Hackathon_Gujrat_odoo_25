from django.shortcuts import render
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import transaction
from .models import User, CountryCode
from .email_service import EmailService
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    ChangePasswordSerializer, CountryCodeSerializer, LogoutSerializer,
    EmailVerificationSerializer, ResendOTPSerializer
)

# Create your views here.

class CountryCodeListView(generics.ListAPIView):
    """API view to get list of country codes"""
    queryset = CountryCode.get_active_countries()
    serializer_class = CountryCodeSerializer
    permission_classes = [permissions.AllowAny]

class UserRegistrationView(APIView):
    """API view for user registration"""
    permission_classes = [permissions.AllowAny]
    
    @transaction.atomic
    def post(self, request):
        """Register a new user"""
        serializer = UserRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = serializer.save()
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                access_token = refresh.access_token
                
                # Send welcome email
                try:
                    EmailService.send_welcome_email(user)
                except Exception as e:
                    print(f"Failed to send welcome email: {e}")
                
                # Send OTP for email verification
                try:
                    email_otp = EmailService.create_otp(user, user.email)
                    EmailService.send_otp_email(user, email_otp.otp)
                except Exception as e:
                    print(f"Failed to send OTP: {e}")
                
                # Return success response with tokens
                return Response({
                    'success': True,
                    'message': 'User registered successfully. Please check your email for verification code.',
                    'data': {
                        'user': {
                            'id': user.id,
                            'first_name': user.first_name,
                            'last_name': user.last_name,
                            'email': user.email,
                            'user_type': user.user_type,
                            'phone_number': str(user.phone_number) if user.phone_number else None,
                            'country_code': user.country_code,
                            'is_email_verified': user.is_email_verified,
                        },
                        'tokens': {
                            'access': str(access_token),
                            'refresh': str(refresh),
                        }
                    }
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({
                    'success': False,
                    'message': 'Registration failed',
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    """API view for user login"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Login user and return JWT tokens"""
        serializer = UserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'user': {
                        'id': user.id,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'email': user.email,
                        'user_type': user.user_type,
                        'phone_number': str(user.phone_number) if user.phone_number else None,
                        'country_code': user.country_code,
                        'is_phone_verified': user.is_phone_verified,
                        'is_email_verified': user.is_email_verified,
                    },
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh),
                    }
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Login failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(APIView):
    """API view for user profile management"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get user profile"""
        serializer = UserProfileSerializer(request.user)
        return Response({
            'success': True,
            'data': serializer.data
        }, status=status.HTTP_200_OK)
    
    def put(self, request):
        """Update user profile"""
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'success': True,
                'message': 'Profile updated successfully',
                'data': serializer.data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    """API view for changing password"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Change user password"""
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password changed successfully'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'message': 'Password change failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """API view for user logout"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Logout user and blacklist refresh token"""
        serializer = LogoutSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                refresh_token = serializer.validated_data['refresh_token']
                
                # Validate the refresh token
                try:
                    token = RefreshToken(refresh_token)
                    token.blacklist()
                except Exception as token_error:
                    return Response({
                        'success': False,
                        'message': 'Invalid refresh token',
                        'error': str(token_error)
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                return Response({
                    'success': True,
                    'message': 'Logout successful'
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                return Response({
                    'success': False,
                    'message': 'Logout failed',
                    'error': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_email_exists(request):
    """Check if email already exists"""
    email = request.GET.get('email')
    
    if not email:
        return Response({
            'success': False,
            'message': 'Email parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(email=email).exists()
    
    return Response({
        'success': True,
        'data': {
            'email': email,
            'exists': exists
        }
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_phone_exists(request):
    """Check if phone number already exists"""
    phone = request.GET.get('phone')
    country_code = request.GET.get('country_code', '+91')
    
    if not phone:
        return Response({
            'success': False,
            'message': 'Phone parameter is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Format phone number with country code
    full_phone = f"{country_code}{phone}"
    exists = User.objects.filter(phone_number=full_phone).exists()
    
    return Response({
        'success': True,
        'data': {
            'phone': phone,
            'country_code': country_code,
            'exists': exists
        }
    }, status=status.HTTP_200_OK)

class SendOTPView(APIView):
    """API view for sending OTP"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Send OTP to user's email"""
        try:
            user = request.user
            
            # Check if email is already verified
            if user.is_email_verified:
                return Response({
                    'success': False,
                    'message': 'Email is already verified'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create and send OTP
            email_otp = EmailService.create_otp(user, user.email)
            
            if EmailService.send_otp_email(user, email_otp.otp):
                return Response({
                    'success': True,
                    'message': 'OTP sent successfully to your email'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Failed to send OTP. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Failed to send OTP',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class VerifyEmailView(APIView):
    """API view for email verification"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Verify email with OTP"""
        print(f"VerifyEmailView called with data: {request.data}")
        print(f"User: {request.user}")
        print(f"User is authenticated: {request.user.is_authenticated}")
        
        serializer = EmailVerificationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                user = request.user
                otp = serializer.validated_data['otp']
                
                print(f"Verifying OTP {otp} for user {user.email}")
                
                # Verify OTP
                success, message = EmailService.verify_otp(user, otp)
                
                print(f"Verification result: {success}, {message}")
                
                if success:
                    return Response({
                        'success': True,
                        'message': message
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'success': False,
                        'message': message
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except Exception as e:
                print(f"Verification error: {e}")
                return Response({
                    'success': False,
                    'message': 'Verification failed',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            print(f"Serializer errors: {serializer.errors}")
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

class ResendOTPView(APIView):
    """API view for resending OTP"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        """Resend OTP to user's email"""
        serializer = ResendOTPSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                email = serializer.validated_data['email']
                user = User.objects.get(email=email)
                
                # Check if email is already verified
                if user.is_email_verified:
                    return Response({
                        'success': False,
                        'message': 'Email is already verified'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Resend OTP
                success, message = EmailService.resend_otp(user)
                
                if success:
                    return Response({
                        'success': True,
                        'message': message
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'success': False,
                        'message': message
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                    
            except User.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                return Response({
                    'success': False,
                    'message': 'Failed to resend OTP',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
