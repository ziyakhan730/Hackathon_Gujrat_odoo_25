from django.core.management.base import BaseCommand
from django.db.models import Q
from courts.models import Court, Facility

class Command(BaseCommand):
    help = "Remove test courts and optionally facilities based on filters. Defaults to dry-run."

    def add_arguments(self, parser):
        parser.add_argument('--name-contains', type=str, default=None, help='Delete courts whose name contains this substring (case-insensitive)')
        parser.add_argument('--facility-name-contains', type=str, default=None, help='Delete courts whose facility name contains this substring')
        parser.add_argument('--owner-email', type=str, default=None, help='Delete courts owned by this owner email')
        parser.add_argument('--all-test', action='store_true', help='Delete common test data patterns (name/description contains "test" or "dummy")')
        parser.add_argument('--include-facilities', action='store_true', help='Also delete facilities matching the facility-name or all-test filters (cascade deletes courts)')
        parser.add_argument('--preserve-court-id', type=int, default=None, help='Do NOT delete this court ID even if it matches filters')
        parser.add_argument('--preserve-facility-id', type=int, default=None, help='Do NOT delete this facility ID even if it matches filters')
        parser.add_argument('--apply', action='store_true', help='Actually perform deletions (otherwise dry-run)')

    def handle(self, *args, **options):
        name_contains = options['name_contains']
        facility_name_contains = options['facility_name_contains']
        owner_email = options['owner_email']
        all_test = options['all_test']
        include_facilities = options['include_facilities']
        apply_changes = options['apply']
        preserve_court_id = options['preserve_court_id']
        preserve_facility_id = options['preserve_facility_id']

        # Build courts queryset
        court_filters = Q()
        if name_contains:
            court_filters &= Q(name__icontains=name_contains)
        if facility_name_contains:
            court_filters &= Q(facility__name__icontains=facility_name_contains)
        if owner_email:
            court_filters &= Q(facility__owner__email__iexact=owner_email)
        if all_test:
            court_filters &= (Q(name__icontains='test') | Q(description__icontains='test') |
                              Q(name__icontains='dummy') | Q(description__icontains='dummy'))

        courts_qs = Court.objects.filter(court_filters) if court_filters else Court.objects.none()
        if preserve_court_id:
            courts_qs = courts_qs.exclude(id=preserve_court_id)

        # Build facilities queryset if requested
        facilities_qs = Facility.objects.none()
        if include_facilities:
            facility_filters = Q()
            if facility_name_contains:
                facility_filters &= Q(name__icontains=facility_name_contains)
            if owner_email:
                facility_filters &= Q(owner__email__iexact=owner_email)
            if all_test:
                facility_filters &= (Q(name__icontains='test') | Q(description__icontains='test') |
                                     Q(name__icontains='dummy') | Q(description__icontains='dummy'))
            facilities_qs = Facility.objects.filter(facility_filters) if facility_filters else Facility.objects.none()
            if preserve_facility_id:
                facilities_qs = facilities_qs.exclude(id=preserve_facility_id)

        # Report summary
        self.stdout.write(self.style.WARNING('Dry-run mode' + ('' if not apply_changes else ' disabled (apply mode)')))
        self.stdout.write(f"Courts matching filters: {courts_qs.count()}")
        for court in courts_qs[:10]:
            self.stdout.write(f" - Court #{court.id}: {court.name} (Facility: {court.facility.name}, Owner: {court.facility.owner.email})")
        if courts_qs.count() > 10:
            self.stdout.write(f" ... and {courts_qs.count() - 10} more courts")

        if include_facilities:
            self.stdout.write(f"Facilities matching filters: {facilities_qs.count()}")
            for fac in facilities_qs[:10]:
                self.stdout.write(f" - Facility #{fac.id}: {fac.name} (Owner: {fac.owner.email})")
            if facilities_qs.count() > 10:
                self.stdout.write(f" ... and {facilities_qs.count() - 10} more facilities")

        if not apply_changes:
            self.stdout.write(self.style.SUCCESS('Dry-run complete. Use --apply to perform deletion.'))
            return

        # Apply deletions
        deleted_courts = courts_qs.count()
        courts_qs.delete()

        deleted_facilities = 0
        if include_facilities:
            deleted_facilities = facilities_qs.count()
            facilities_qs.delete()

        self.stdout.write(self.style.SUCCESS(
            f"Deleted courts: {deleted_courts}. Deleted facilities: {deleted_facilities}."
        )) 