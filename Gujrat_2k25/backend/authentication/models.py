from django.contrib.auth.models import AbstractUser
from django.db import models
from phonenumber_field.modelfields import PhoneNumberField
from django.core.validators import RegexValidator
import re

class User(AbstractUser):
    USER_TYPE_CHOICES = [
        ('player', 'Player'),
        ('owner', 'Court Owner'),
    ]
    
    # Basic fields
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    
    # User type
    user_type = models.CharField(
        max_length=10,
        choices=USER_TYPE_CHOICES,
        default='player'
    )
    
    # Phone number with country code
    phone_number = PhoneNumberField(unique=True, null=True, blank=True)
    country_code = models.CharField(max_length=5, default='+91')
    
    # Additional fields
    is_phone_verified = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)
    profile_picture = models.URLField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Override username to use email
    username = models.CharField(max_length=150, unique=True, null=True, blank=True)
    
    # Required fields for registration
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'user_type']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        return self.first_name
    
    def clean(self):
        super().clean()
        # Validate phone number format based on country code
        if self.phone_number and self.country_code:
            self.validate_phone_number()
    
    def validate_phone_number(self):
        """Validate phone number length based on country code"""
        if not self.phone_number:
            return
        
        # Remove country code from phone number for validation
        phone_str = str(self.phone_number)
        
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
        
        expected_length = country_lengths.get(self.country_code, 10)
        
        # Remove any non-digit characters for length check
        digits_only = re.sub(r'\D', '', phone_str)
        
        if len(digits_only) != expected_length:
            raise models.ValidationError(
                f'Phone number for {self.country_code} should be {expected_length} digits long'
            )

class CountryCode(models.Model):
    """Model to store country codes and their information"""
    code = models.CharField(max_length=5, unique=True)
    country = models.CharField(max_length=100)
    flag = models.CharField(max_length=10, blank=True)  # Emoji flag
    phone_length = models.IntegerField(default=10)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['country']
    
    def __str__(self):
        return f"{self.flag} {self.country} ({self.code})"
    
    @classmethod
    def get_active_countries(cls):
        """Get all active country codes"""
        return cls.objects.filter(is_active=True)
