#!/usr/bin/env python
"""
Test JWT token validation manually
"""
import os
import sys
import django
import jwt
from datetime import datetime

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.conf import settings
from authentication.models import User

def test_jwt_token(token_string):
    """Test JWT token validation"""
    print(f"Testing JWT token: {token_string[:20]}...")
    print("-" * 50)
    
    try:
        # Decode the token
        payload = jwt.decode(
            token_string, 
            settings.SECRET_KEY, 
            algorithms=['HS256']
        )
        
        print(f"✅ Token decoded successfully")
        print(f"📋 Payload: {payload}")
        
        # Get user from payload
        user_id = payload.get('user_id')
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                print(f"✅ User found: {user.email}")
                print(f"📧 Email verified: {user.is_email_verified}")
                return user
            except User.DoesNotExist:
                print(f"❌ User with ID {user_id} not found")
                return None
        else:
            print(f"❌ No user_id in token payload")
            return None
            
    except jwt.ExpiredSignatureError:
        print(f"❌ Token has expired")
        return None
    except jwt.InvalidTokenError as e:
        print(f"❌ Invalid token: {e}")
        return None
    except Exception as e:
        print(f"❌ Error decoding token: {e}")
        return None

def create_test_token():
    """Create a test JWT token for the user"""
    print("Creating test JWT token...")
    print("-" * 50)
    
    try:
        user = User.objects.get(email='manansahni295@gmail.com')
        
        # Create token payload
        payload = {
            'user_id': user.id,
            'email': user.email,
            'exp': datetime.utcnow().timestamp() + 3600,  # 1 hour from now
            'iat': datetime.utcnow().timestamp(),
        }
        
        # Generate token
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        
        print(f"✅ Created test token: {token}")
        print(f"📋 Payload: {payload}")
        
        # Test the token
        test_jwt_token(token)
        
        return token
        
    except User.DoesNotExist:
        print("❌ Test user not found")
        return None
    except Exception as e:
        print(f"❌ Error creating token: {e}")
        return None

if __name__ == '__main__':
    # Create a test token
    test_token = create_test_token()
    
    if test_token:
        print(f"\nTest token for frontend: {test_token}") 