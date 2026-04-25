"""
Management command: seed_roles
==============================
Idempotently creates the four application roles.
Safe to run multiple times — uses get_or_create throughout.

Usage:
    python manage.py seed_roles
"""

from django.core.management.base import BaseCommand

from users.models import Role

# Roles seeded by this command.
# 'manager' is included so admins can promote users later.
# 'admin' is intentionally absent — that tier maps to Django's
# is_staff / is_superuser flags, not a Role row.
ROLES = ["volunteer", "seeker", "manager"]


class Command(BaseCommand):
    help = "Seed the database with the required application roles."

    def handle(self, *args, **options):
        created_count = 0
        for name in ROLES:
            _, created = Role.objects.get_or_create(name=name)
            if created:
                self.stdout.write(self.style.SUCCESS(f"  Created role: '{name}'"))
                created_count += 1
            else:
                self.stdout.write(f"  Role already exists: '{name}'")

        if created_count:
            self.stdout.write(
                self.style.SUCCESS(f"\nDone. {created_count} role(s) created.")
            )
        else:
            self.stdout.write("\nAll roles already present. Nothing to do.")