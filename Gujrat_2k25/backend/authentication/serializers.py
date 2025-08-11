from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, CountryCode

class CountryCodeSerializer(serializers.ModelSerializer):
    """Serializer for country codes"""
    class Meta:
        model = CountryCode
        fields = ['code', 'country', 'flag', 'phone_length']

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    country_code = serializers.CharField(max_length=5, default='+91')
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'email', 'phone_number', 
            'country_code', 'user_type', 'password', 'confirm_password'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'phone_number': {'required': True},
            'user_type': {'required': True},
        }
    
    def validate(self, attrs):
        """Validate the data"""
        # Check if passwords match
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Check if email already exists
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError("Email already exists")
        
        # Validate phone number length based on country code
        if attrs.get('phone_number') and attrs.get('country_code'):
            self.validate_phone_number_length(attrs['phone_number'], attrs['country_code'])
            
            # Combine country code with phone number for PhoneNumberField
            full_phone = f"{attrs['country_code']}{attrs['phone_number']}"
            attrs['phone_number'] = full_phone
        
        # Check if phone number already exists (after combining with country code)
        if attrs.get('phone_number') and User.objects.filter(phone_number=attrs['phone_number']).exists():
            raise serializers.ValidationError("Phone number already exists")
        
        return attrs
    
    def validate_phone_number_length(self, phone_number, country_code):
        """Validate phone number length based on country code"""
        import re
        
        # Country code to expected length mapping
        country_lengths = {
            '+91': 10,  # India
            '+1': 10,   # US/Canada
            '+44': 10,  # UK
            '+61': 9,   # Australia
            '+86': 11,  # China
            '+81': 10,  # Japan
            '+49': 11,  # Germany
            '+33': 9,   # France
            '+39': 10,  # Italy
            '+34': 9,   # Spain
            '+7': 10,   # Russia
            '+55': 11,  # Brazil
            '+52': 10,  # Mexico
            '+27': 9,   # South Africa
            '+971': 9,  # UAE
            '+966': 9,  # Saudi Arabia
            '+65': 8,   # Singapore
            '+60': 9,   # Malaysia
            '+66': 9,   # Thailand
            '+84': 9,   # Vietnam
        }
        
        expected_length = country_lengths.get(country_code, 10)
        phone_str = str(phone_number)
        
        # Remove any non-digit characters for length check
        digits_only = re.sub(r'\D', '', phone_str)
        
        # For PhoneNumberField, we need to check the length without the country code
        # The phone_number should be just the national number (without country code)
        if len(digits_only) != expected_length:
            raise serializers.ValidationError(
                f'Phone number for {country_code} should be {expected_length} digits long'
            )
    
    def create(self, validated_data):
        """Create a new user"""
        validated_data.pop('confirm_password')
        
        # Create user with email as username and set as inactive until email verification
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number'),
            country_code=validated_data.get('country_code', '+91'),
            user_type=validated_data['user_type'],
            is_active=False  # User is inactive until email is verified
        )
        
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        """Validate login credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Try to authenticate with email
            user = authenticate(username=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            
            if not user.is_active:
                if not user.is_email_verified:
                    raise serializers.ValidationError('Please verify your email address before logging in. Check your email for the verification code.')
                else:
                    raise serializers.ValidationError('User account is disabled')
            
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    class Meta:
        model = User
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone_number', 
            'country_code', 'user_type', 'is_phone_verified', 'is_email_verified',
            'profile_picture', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """Validate password change"""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        """Validate old password"""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value

class LogoutSerializer(serializers.Serializer):
    """Serializer for user logout"""
    refresh_token = serializers.CharField(required=True)
    
    def validate_refresh_token(self, value):
        """Validate refresh token"""
        if not value:
            raise serializers.ValidationError("Refresh token is required")
        return value

class EmailVerificationSerializer(serializers.Serializer):
    """Serializer for email verification"""
    otp = serializers.CharField(max_length=6, min_length=6, required=True)
    email = serializers.EmailField(required=False)  # Optional for authenticated users
    
    def validate_otp(self, value):
        """Validate OTP format"""
        if not value.isdigit():
            raise serializers.ValidationError("OTP must contain only digits")
        return value

class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        """Validate email exists"""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user found with this email address")
        return value 