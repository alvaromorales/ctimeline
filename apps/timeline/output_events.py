from django.utils import simplejson
from time import strftime
from datetime import date, time, datetime
import ast

def create_json(events):

    data = {
        'dateTimeFormat' : 'Gregorian',
        'events' : [],
        }

    for e in events:

        tags = e.tags.all()
        tags_list = [t.__unicode__() for t in tags]

        #if tags_list == []:
        #    tags_list = {}

        event_attrs = {
            'db_id' : e.id,
            'title' : e.title,
            'description' : e.description,
            'durationEvent' : e.durationEvent,
            'votes' : e.votes,
            'tags' : tags_list
            }

        if e.startTime:
            full_d = datetime.combine(e.startDate,e.startTime)
            start = '%s GMT' % full_d.strftime('%b %d %Y %H:%M:%S')
        else:
            full_d = datetime.combine(e.startDate,time())
            start = '%s GMT' % full_d.strftime('%b %d %Y %H:%M:%S')
        
        event_attrs['start'] = start

        if e.durationEvent:
            if e.endTime:
                full_d = datetime.combine(e.endDate,e.endTime)
                end = '%s GMT' % full_d.strftime('%b %d %Y %H:%M:%S')
            else:
                full_d = datetime.combine(e.endDate,time())
                end = '%s GMT' % full_d.strftime('%b %d %Y %H:%M:%S')

            event_attrs['end'] = end

        data['events'].append(event_attrs)

    return simplejson.dumps(data)
