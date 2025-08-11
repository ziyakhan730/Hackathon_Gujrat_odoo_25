from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CountryCode

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'user_type', 'is_active', 'date_joined')
    list_filter = ('user_type', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'phone_number', 'country_code', 'user_type')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Verification', {'fields': ('is_email_verified', 'is_phone_verified')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'phone_number', 'country_code', 'user_type', 'password1', 'password2'),
        }),
    )

@admin.register(CountryCode)
class CountryCodeAdmin(admin.ModelAdmin):
    list_display = ('flag', 'country', 'code', 'phone_length', 'is_active')
    list_filter = ('is_active', 'phone_length')
    search_fields = ('country', 'code')
    ordering = ('country',)
    
    fieldsets = (
        (None, {'fields': ('code', 'country', 'flag', 'phone_length', 'is_active')}),
    )
