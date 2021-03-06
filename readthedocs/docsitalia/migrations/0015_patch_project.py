# -*- coding: utf-8 -*-
# Generated by Django 1.11.24 on 2019-10-30 22:20
from __future__ import unicode_literals

import os

from django.db import migrations, models

from .. import monkeypatch


def fix_container_time_limit(apps, schema_editor):

    Project = apps.get_model('projects.Project')
    v = Project.objects.filter(container_time_limit='')
    v.update(container_time_limit=0)


class Migration(migrations.Migration):
    dependencies = [
        ('docsitalia', '0014_allowedtag'),
    ]
    if os.environ.get('DOCSITALIA_UPGRADE', False):
        run_before = [
            ('projects', '0030_change-max-length-project-slug')
        ]

        operations = [
            # required by migration in projects.0035_container_time_limit_as_integer.
            migrations.RunPython(fix_container_time_limit, migrations.RunPython.noop),
        ]
    else:
        operations = []
