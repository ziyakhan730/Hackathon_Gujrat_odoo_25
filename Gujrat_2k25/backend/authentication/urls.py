from django.urls import path
from . import views

app_name = 'authentication'

urlpatterns = [
    # Country codes
    path('country-codes/', views.CountryCodeListView.as_view(), name='country-codes'),
    
    # Authentication
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    
    # User profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    
    # Validation endpoints
    path('check-email/', views.check_email_exists, name='check-email'),
    path('check-phone/', views.check_phone_exists, name='check-phone'),
] 