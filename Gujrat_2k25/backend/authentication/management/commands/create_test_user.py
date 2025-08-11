from django.core.management.base import BaseCommand
from authentication.models import User

class Command(BaseCommand):
    help = 'Create a test user for authentication'

    def handle(self, *args, **options):
        # Create test user with the email format from the image
        email = 'bacn1ca24093@itmuniversity.a'
        password = 'password@1'
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            user = User.objects.get(email=email)
            user.set_password(password)
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Updated existing user: {email}')
            )
        else:
            # Create new user
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name='Test',
                last_name='User',
                user_type='owner',
                phone_number='+919876543211',  # Changed phone number
                country_code='+91'
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created new user: {email}')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'Login credentials: {email} / {password}')
        ) 