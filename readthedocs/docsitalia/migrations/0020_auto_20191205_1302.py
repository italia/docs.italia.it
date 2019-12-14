# -*- coding: utf-8 -*-
# Generated by Django 1.11.24 on 2019-12-05 12:02
from __future__ import unicode_literals

from django.db import migrations


def create_project_order(apps, schema_editor):
    Project = apps.get_model('projects', 'Project')
    ProjectOrder = apps.get_model('docsitalia', 'ProjectOrder')
    for priority, project in enumerate(Project.objects.all()):
        ProjectOrder.objects.get_or_create(project=project, defaults={'priority':priority})


class Migration(migrations.Migration):

    dependencies = [
        ('docsitalia', '0019_projectorder'),
    ]

    operations = [
        migrations.RunPython(create_project_order),
    ]
