# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Timeline'
        db.create_table('timeline_timeline', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=200)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=500)),
        ))
        db.send_create_signal('timeline', ['Timeline'])

        # Adding model 'EventTag'
        db.create_table('timeline_eventtag', (
            ('tag_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['taggit.Tag'], unique=True, primary_key=True)),
            ('timeline', self.gf('django.db.models.fields.related.ForeignKey')(related_name='timeline_eventtag_timelines', to=orm['timeline.Timeline'])),
        ))
        db.send_create_signal('timeline', ['EventTag'])

        # Adding model 'TaggedEvent'
        db.create_table('timeline_taggedevent', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('content_object', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['timeline.Event'])),
            ('tag', self.gf('django.db.models.fields.related.ForeignKey')(related_name='timeline_taggedevent_items', to=orm['timeline.EventTag'])),
        ))
        db.send_create_signal('timeline', ['TaggedEvent'])

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


    def backwards(self, orm):
        # Deleting model 'Timeline'
        db.delete_table('timeline_timeline')

        # Deleting model 'EventTag'
        db.delete_table('timeline_eventtag')

        # Deleting model 'TaggedEvent'
        db.delete_table('timeline_taggedevent')

        # Deleting model 'Event'
        db.delete_table('timeline_event')


    models = {
        'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        },
        'taggit.tag': {
            'Meta': {'object_name': 'Tag'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'}),
            'slug': ('django.db.models.fields.SlugField', [], {'unique': 'True', 'max_length': '100'})
        },
        'taggit.taggeditem': {
            'Meta': {'object_name': 'TaggedItem'},
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'taggit_taggeditem_tagged_items'", 'to': "orm['contenttypes.ContentType']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'object_id': ('django.db.models.fields.IntegerField', [], {'db_index': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'taggit_taggeditem_items'", 'to': "orm['taggit.Tag']"})
        },
        'timeline.event': {
            'Meta': {'object_name': 'Event'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'durationEvent': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'endDate': ('django.db.models.fields.DateField', [], {'null': 'True', 'blank': 'True'}),
            'endTime': ('django.db.models.fields.TimeField', [], {'null': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'startDate': ('django.db.models.fields.DateField', [], {}),
            'startTime': ('django.db.models.fields.TimeField', [], {'null': 'True', 'blank': 'True'}),
            'timeline': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'events'", 'to': "orm['timeline.Timeline']"}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'}),
            'votes': ('django.db.models.fields.PositiveIntegerField', [], {'default': '0'})
        },
        'timeline.eventtag': {
            'Meta': {'object_name': 'EventTag', '_ormbases': ['taggit.Tag']},
            'tag_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': "orm['taggit.Tag']", 'unique': 'True', 'primary_key': 'True'}),
            'timeline': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'timeline_eventtag_timelines'", 'to': "orm['timeline.Timeline']"})
        },
        'timeline.taggedevent': {
            'Meta': {'object_name': 'TaggedEvent'},
            'content_object': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['timeline.Event']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'tag': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'timeline_taggedevent_items'", 'to': "orm['timeline.EventTag']"})
        },
        'timeline.timeline': {
            'Meta': {'object_name': 'Timeline'},
            'description': ('django.db.models.fields.CharField', [], {'max_length': '500'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '200'})
        }
    }

    complete_apps = ['timeline']