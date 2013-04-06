# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Event'
        db.create_table('timeline_event', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('timeline', self.gf('django.db.models.fields.related.ForeignKey')(related_name='events', to=orm['timeline.Timeline'])),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=500)),
            ('startDate', self.gf('django.db.models.fields.DateField')()),
            ('startTime', self.gf('django.db.models.fields.TimeField')(null=True, blank=True)),
            ('endDate', self.gf('django.db.models.fields.DateField')(null=True, blank=True)),
            ('endTime', self.gf('django.db.models.fields.TimeField')(null=True, blank=True)),
            ('durationEvent', self.gf('django.db.models.fields.BooleanField')(default=False)),
            ('votes', self.gf('django.db.models.fields.PositiveIntegerField')(default=0)),
        ))
        db.send_create_signal('timeline', ['Event'])

        # Adding M2M table for field tags on 'Event'
        db.create_table('timeline_event_tags', (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('event', models.ForeignKey(orm['timeline.event'], null=False)),
            ('tag', models.ForeignKey(orm['timeline.tag'], null=False))
        ))
        db.create_unique('timeline_event_tags', ['event_id', 'tag_id'])

        # Adding model 'Tag'
        db.create_table('timeline_tag', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('tag', self.gf('django.db.models.fields.CharField')(max_length=100)),
            ('timeline', self.gf('django.db.models.fields.related.ForeignKey')(blank=True, related_name='tags', null=True, to=orm['timeline.Timeline'])),
        ))
        db.send_create_signal('timeline', ['Tag'])

        # Adding model 'Timeline'
        db.create_table('timeline_timeline', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=500)),
        ))
        db.send_create_signal('timeline', ['Timeline'])


    def backwards(self, orm):
        # Deleting model 'Event'
        db.delete_table('timeline_event')

        # Removing M2M table for field tags on 'Event'
        db.delete_table('timeline_event_tags')

        # Deleting model 'Tag'
        db.delete_table('timeline_tag')

        # Deleting model 'Timeline'
        db.delete_table('timeline_timeline')


    models = {
        'timeline.event': {
            'Meta': {'object_name': 'Event'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'durationEvent': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'endDate': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'endTime': ('django.db.models.fields.TimeField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'startDate': ('django.db.models.fields.DateField', [], {}),
            'startTime': ('django.db.models.fields.TimeField', [], {'null': 'True', 'blank': 'True'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': "orm['timeline.Tag']", 'null': 'True', 'blank': 'True'}),
            'timeline': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'events'", 'to': "orm['timeline.Timeline']"}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'votes': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'})
        },
        'timeline.tag': {
            'Meta': {'object_name': 'Tag'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tag': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'timeline': ('django.db.models.fields.related.ForeignKey', [], {'blank': 'True', 'related_name': "'tags'", 'null': 'True', 'to': "orm['timeline.Timeline']"})
        },
        'timeline.timeline': {
            'Meta': {'object_name': 'Timeline'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['timeline']