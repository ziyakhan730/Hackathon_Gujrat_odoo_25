from django.core.management.base import BaseCommand
from authentication.models import CountryCode

class Command(BaseCommand):
    help = 'Populate country codes with flags and phone lengths'

    def handle(self, *args, **options):
        country_data = [
            {'code': '+91', 'country': 'India', 'flag': '🇮🇳', 'phone_length': 10},
            {'code': '+1', 'country': 'United States', 'flag': '🇺🇸', 'phone_length': 10},
            {'code': '+1', 'country': 'Canada', 'flag': '🇨🇦', 'phone_length': 10},
            {'code': '+44', 'country': 'United Kingdom', 'flag': '🇬🇧', 'phone_length': 10},
            {'code': '+61', 'country': 'Australia', 'flag': '🇦🇺', 'phone_length': 9},
            {'code': '+86', 'country': 'China', 'flag': '🇨🇳', 'phone_length': 11},
            {'code': '+81', 'country': 'Japan', 'flag': '🇯🇵', 'phone_length': 10},
            {'code': '+49', 'country': 'Germany', 'flag': '🇩🇪', 'phone_length': 11},
            {'code': '+33', 'country': 'France', 'flag': '🇫🇷', 'phone_length': 9},
            {'code': '+39', 'country': 'Italy', 'flag': '🇮🇹', 'phone_length': 10},
            {'code': '+34', 'country': 'Spain', 'flag': '🇪🇸', 'phone_length': 9},
            {'code': '+7', 'country': 'Russia', 'flag': '🇷🇺', 'phone_length': 10},
            {'code': '+55', 'country': 'Brazil', 'flag': '🇧🇷', 'phone_length': 11},
            {'code': '+52', 'country': 'Mexico', 'flag': '🇲🇽', 'phone_length': 10},
            {'code': '+27', 'country': 'South Africa', 'flag': '🇿🇦', 'phone_length': 9},
            {'code': '+971', 'country': 'United Arab Emirates', 'flag': '🇦🇪', 'phone_length': 9},
            {'code': '+966', 'country': 'Saudi Arabia', 'flag': '🇸🇦', 'phone_length': 9},
            {'code': '+65', 'country': 'Singapore', 'flag': '🇸🇬', 'phone_length': 8},
            {'code': '+60', 'country': 'Malaysia', 'flag': '🇲🇾', 'phone_length': 9},
            {'code': '+66', 'country': 'Thailand', 'flag': '🇹🇭', 'phone_length': 9},
            {'code': '+84', 'country': 'Vietnam', 'flag': '🇻🇳', 'phone_length': 9},
            {'code': '+82', 'country': 'South Korea', 'flag': '🇰🇷', 'phone_length': 10},
            {'code': '+31', 'country': 'Netherlands', 'flag': '🇳🇱', 'phone_length': 9},
            {'code': '+46', 'country': 'Sweden', 'flag': '🇸🇪', 'phone_length': 9},
            {'code': '+47', 'country': 'Norway', 'flag': '🇳🇴', 'phone_length': 8},
            {'code': '+45', 'country': 'Denmark', 'flag': '🇩🇰', 'phone_length': 8},
            {'code': '+358', 'country': 'Finland', 'flag': '🇫🇮', 'phone_length': 9},
            {'code': '+41', 'country': 'Switzerland', 'flag': '🇨🇭', 'phone_length': 9},
            {'code': '+43', 'country': 'Austria', 'flag': '🇦🇹', 'phone_length': 10},
            {'code': '+32', 'country': 'Belgium', 'flag': '🇧🇪', 'phone_length': 9},
            {'code': '+351', 'country': 'Portugal', 'flag': '🇵🇹', 'phone_length': 9},
            {'code': '+30', 'country': 'Greece', 'flag': '🇬🇷', 'phone_length': 10},
            {'code': '+48', 'country': 'Poland', 'flag': '🇵🇱', 'phone_length': 9},
            {'code': '+420', 'country': 'Czech Republic', 'flag': '🇨🇿', 'phone_length': 9},
            {'code': '+36', 'country': 'Hungary', 'flag': '🇭🇺', 'phone_length': 9},
            {'code': '+380', 'country': 'Ukraine', 'flag': '🇺🇦', 'phone_length': 9},
            {'code': '+48', 'country': 'Poland', 'flag': '🇵🇱', 'phone_length': 9},
            {'code': '+90', 'country': 'Turkey', 'flag': '🇹🇷', 'phone_length': 10},
            {'code': '+972', 'country': 'Israel', 'flag': '🇮🇱', 'phone_length': 9},
            {'code': '+20', 'country': 'Egypt', 'flag': '🇪🇬', 'phone_length': 10},
            {'code': '+234', 'country': 'Nigeria', 'flag': '🇳🇬', 'phone_length': 10},
            {'code': '+254', 'country': 'Kenya', 'flag': '🇰🇪', 'phone_length': 9},
            {'code': '+27', 'country': 'South Africa', 'flag': '🇿🇦', 'phone_length': 9},
            {'code': '+880', 'country': 'Bangladesh', 'flag': '🇧🇩', 'phone_length': 10},
            {'code': '+94', 'country': 'Sri Lanka', 'flag': '🇱🇰', 'phone_length': 9},
            {'code': '+977', 'country': 'Nepal', 'flag': '🇳🇵', 'phone_length': 10},
            {'code': '+880', 'country': 'Bangladesh', 'flag': '🇧🇩', 'phone_length': 10},
            {'code': '+95', 'country': 'Myanmar', 'flag': '🇲🇲', 'phone_length': 9},
            {'code': '+856', 'country': 'Laos', 'flag': '🇱🇦', 'phone_length': 10},
            {'code': '+855', 'country': 'Cambodia', 'flag': '🇰🇭', 'phone_length': 9},
            {'code': '+673', 'country': 'Brunei', 'flag': '🇧🇳', 'phone_length': 7},
            {'code': '+670', 'country': 'East Timor', 'flag': '🇹🇱', 'phone_length': 8},
            {'code': '+62', 'country': 'Indonesia', 'flag': '🇮🇩', 'phone_length': 9},
            {'code': '+63', 'country': 'Philippines', 'flag': '🇵🇭', 'phone_length': 10},
            {'code': '+852', 'country': 'Hong Kong', 'flag': '🇭🇰', 'phone_length': 8},
            {'code': '+853', 'country': 'Macau', 'flag': '🇲🇴', 'phone_length': 8},
            {'code': '+886', 'country': 'Taiwan', 'flag': '🇹🇼', 'phone_length': 9},
        ]

        created_count = 0
        updated_count = 0

        for data in country_data:
            country_code, created = CountryCode.objects.get_or_create(
                code=data['code'],
                defaults={
                    'country': data['country'],
                    'flag': data['flag'],
                    'phone_length': data['phone_length'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created: {data["flag"]} {data["country"]} ({data["code"]})')
                )
            else:
                # Update existing record
                country_code.country = data['country']
                country_code.flag = data['flag']
                country_code.phone_length = data['phone_length']
                country_code.is_active = True
                country_code.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'Updated: {data["flag"]} {data["country"]} ({data["code"]})')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated country codes. Created: {created_count}, Updated: {updated_count}'
            )
        ) 