from django.core.management.base import BaseCommand
from courts.models import Sport, Amenity

class Command(BaseCommand):
    help = 'Populate initial sports and amenities data'

    def handle(self, *args, **options):
        # Create sports with specific icons
        sports_data = [
            {'name': 'Badminton', 'icon': '🏸', 'description': 'Badminton courts with proper flooring'},
            {'name': 'Basketball', 'icon': '🏀', 'description': 'Basketball courts for indoor and outdoor play'},
            {'name': 'Cricket', 'icon': '🏏', 'description': 'Cricket grounds with proper pitches'},
            {'name': 'Football', 'icon': '⚽', 'description': 'Football/soccer fields for various formats'},
            {'name': 'Gym', 'icon': '💪', 'description': 'Gym and fitness facilities'},
            {'name': 'Squash', 'icon': '🥎', 'description': 'Squash courts with proper walls'},
            {'name': 'Swimming', 'icon': '🏊', 'description': 'Swimming pools and aquatic facilities'},
            {'name': 'Table Tennis', 'icon': '🏓', 'description': 'Table tennis facilities'},
            {'name': 'Tennis', 'icon': '🎾', 'description': 'Tennis courts with professional surfaces'},
            {'name': 'Volleyball', 'icon': '🏐', 'description': 'Volleyball courts for indoor and beach volleyball'},
        ]

        for sport_data in sports_data:
            sport, created = Sport.objects.get_or_create(
                name=sport_data['name'],
                defaults=sport_data
            )
            if created:
                self.stdout.write(f'Created sport: {sport.name}')
            else:
                # Update existing sport with new icon and description
                sport.icon = sport_data['icon']
                sport.description = sport_data['description']
                sport.save()
                self.stdout.write(f'Updated sport: {sport.name}')

        # Create amenities with specific icons
        amenities_data = [
            {'name': 'Air Conditioning', 'icon': '❄️', 'description': 'Air conditioned facilities'},
            {'name': 'Cafeteria', 'icon': '🍽️', 'description': 'Food and beverages available'},
            {'name': 'Changing Rooms', 'icon': '🚿', 'description': 'Clean changing rooms and showers'},
            {'name': 'Coach/Trainer', 'icon': '👨‍🏫', 'description': 'Professional coaches available'},
            {'name': 'Equipment Rental', 'icon': '🎾', 'description': 'Sports equipment available for rent'},
            {'name': 'First Aid', 'icon': '🏥', 'description': 'First aid facilities available'},
            {'name': 'Lighting', 'icon': '💡', 'description': 'Proper lighting for evening games'},
            {'name': 'Lockers', 'icon': '🔒', 'description': 'Secure lockers for personal belongings'},
            {'name': 'Parking', 'icon': '🚗', 'description': 'Free parking available'},
            {'name': 'Spectator Seating', 'icon': '🪑', 'description': 'Seating for spectators'},
            {'name': 'Water Dispenser', 'icon': '💧', 'description': 'Free drinking water'},
            {'name': 'WiFi', 'icon': '📶', 'description': 'Free WiFi access'},
        ]

        for amenity_data in amenities_data:
            amenity, created = Amenity.objects.get_or_create(
                name=amenity_data['name'],
                defaults=amenity_data
            )
            if created:
                self.stdout.write(f'Created amenity: {amenity.name}')
            else:
                # Update existing amenity with new icon and description
                amenity.icon = amenity_data['icon']
                amenity.description = amenity_data['description']
                amenity.save()
                self.stdout.write(f'Updated amenity: {amenity.name}')

        self.stdout.write(
            self.style.SUCCESS('Successfully populated sports and amenities data')
        ) 