from django.db import migrations
from django.conf import settings
from django.contrib.auth.hashers import make_password
import os

def create_default_superuser(apps, schema_editor):
    User = apps.get_model('users', 'User')
    
    admin_email = getattr(settings, 'ADMIN_EMAIL', None)
    admin_password = getattr(settings, 'ADMIN_PASSWORD', None)
    
    if admin_email and admin_password:
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create(
                email=admin_email,
                password=make_password(admin_password),
                first_name='Admin',
                last_name='Superuser',
                country='Default',
                gender='male',
                linkedin='https://linkedin.com/',
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            print(f"\\nSuccessfully created default superuser: {admin_email}")

def reverse_create_default_superuser(apps, schema_editor):
    User = apps.get_model('users', 'User')
    admin_email = getattr(settings, 'ADMIN_EMAIL', None)
    
    if admin_email:
        User.objects.filter(email=admin_email).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_alter_user_gender_alter_user_is_active_and_more'),
    ]

    operations = [
        migrations.RunPython(create_default_superuser, reverse_create_default_superuser),
    ]
