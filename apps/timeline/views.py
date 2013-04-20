from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from forms import NewTimelineForm, NewEventForm
from models import Timeline,Event
from datetime import date, time
from time import strptime
from output_events import create_json
from django.utils import simplejson
from taggit.models import Tag

months = {
    'January' : 1,
    'February' : 2,
    'March' : 3,
    'April' : 4,
    'May' : 5,
    'June' : 6,
    'July' : 7,
    'August' : 8,
    'September' : 9,
    'October' : 10,
    'November' : 11,
    'December' : 12
}

def index(request,timeline_id):
    t = get_object_or_404(Timeline, pk=timeline_id)

    events = create_json(t.events.all())
    tags = sorted([tag.name for tag in Tag.objects.filter(event__timeline=t)])
    
    return render_to_response('timeline/index.html',
                              {'timeline': t},
                              context_instance = RequestContext(request))

def get_timeline_data(request,timeline_id):
    if request.method == 'GET':
        t = get_object_or_404(Timeline, pk=timeline_id)
        events = create_json(t.events.all())
        tags = simplejson.dumps(sorted([tag.name for tag in Tag.objects.filter(event__timeline=t)]))
        return HttpResponse(
            simplejson.dumps((events,tags)), 
            mimetype='application/json')

def get_events(request,timeline_id):
    if request.method == 'GET':
        t = get_object_or_404(Timeline, pk=timeline_id)
        events = create_json(t.events.all())
        return HttpResponse(events, mimetype='application/json')

def get_tags(request,timeline_id_):
    if request.method == 'GET':
        t = get_object_or_404(Timeline, pk=timeline_id)
        tags = simplejson.dumps(sorted([tag.name for tag in Tag.objects.filter(event__timeline=t)]))
        return HttpResponse(tags, mimetype='application/json')

def upvote(request,timeline_id):
    if request.method == 'GET':
        event_id = request.GET[u'id']
        e = get_object_or_404(Event,pk=event_id)
        e.votes += 1
        e.save()
        
        t = e.timeline
        all_events = t.events.all()
        data = create_json(all_events)

        return HttpResponse(data, mimetype='application/json')
    return HttpResponse("error")

def new_event(request,timeline_id):
    if request.method == 'POST':
        t = get_object_or_404(Timeline, pk=timeline_id)
        
        # Take data from request and change it to Simile Timeline event format

        newEvent = request.POST.copy()
        newEvent['title'] = request.POST[u'title']
        newEvent['description'] = request.POST[u'description']
        newEvent['tags'] = request.POST[u'tags']

        # Generate startdate Date object
        startDay = int(request.POST[u'startDay'])
        startMonth = months[request.POST[u'startMonth']]
        startYear = int(request.POST[u'startYear'])
        startDate = date(startYear,startMonth,startDay)
        newEvent['startDate'] = startDate
        
        if request.POST[u'startTimeEnabled'] == 'True':
            startHour = int(request.POST[u'startTimeHour'])
            if request.POST[u'startAmPm'] == 'PM':
                startHour += 12
            startMin = int(request.POST[u'startTimeMin'])
            newEvent['startTime'] = time(startHour,startMin)

        if request.POST[u'eventType'] == 'duration':
            newEvent['durationEvent'] = True
            
            # Generate startdate Date object
            endDay = int(request.POST[u'endDay'])
            endMonth = months[request.POST[u'endMonth']]
            endYear = int(request.POST[u'endYear'])
            endDate = date(endYear,endMonth,endDay)
            newEvent['endDate'] = endDate

            if request.POST[u'endTimeEnabled'] == 'True':
                endHour = int(request.POST[u'endTimeHour'])
                if request.POST[u'endAmPm'] == 'PM':
                    endHour += 12
                endMin = int(request.POST[u'endTimeMin'])
                newEvent['endTime'] = time(endHour,endMin)
        
        else:
            newEvent['durationEvent'] = False

        editing_event = (newEvent[u'edit'] == 'true')

        if editing_event:
            e = Event.objects.get(pk=newEvent[u'db_id'])
            e.title = newEvent['title']
            e.description = newEvent['description']
            e.startDate = newEvent['startDate']
            e.durationEvent = newEvent['durationEvent']
            
            e.tags.set(*newEvent['tags'].split(','))

            if 'startTime' in newEvent:
                e.startTime = newEvent['startTime']
            else:
                e.startTime = None

            if e.durationEvent:
                e.endDate = newEvent['endDate']
                if 'endTime' in newEvent:
                    e.endTime = newEvent['endTime']
                else:
                    e.endTime = None
            else:
                e.endDate = None
                e.endTime = None
            
            e.save()

        else:
            newEvent['votes'] = 0

            form = NewEventForm(newEvent)
            if form.is_valid():
                obj = form.save(commit=False)
                obj.timeline = t
                obj.save()
                
                e = get_object_or_404(Event, pk=obj.id)
                form.save_m2m()

        all_events = t.events.all()
        data = create_json(all_events)

        return HttpResponse(data, mimetype='application/json')

def filter(request,timeline_id):
    if request.method == 'GET':
        t = get_object_or_404(Timeline, pk=timeline_id)
        
        votes_filter = int(request.GET[u'votes'])
        tags_filter = simplejson.loads(request.GET[u'tag_list'])

        if votes_filter == 0 and tags_filter == []:
            all_events = t.events.all()
            data = create_json(all_events)
        else:
            if tags_filter:
                matches = Event.objects.filter(votes__gte=votes_filter)
                matches = matches.filter(tags__name__in=tags_filter)
            else:
                matches = Event.objects.filter(votes__gte=votes_filter)
            data = create_json(matches)

        return HttpResponse(data, mimetype='application/json')
        
