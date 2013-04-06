from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from forms import NewTimelineForm, NewEventForm
from models import Timeline,Event,Tag
from datetime import date, time
from time import strptime
from output_events import create_json
from django.utils import simplejson

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

def index(request):
    if request.method == 'POST':
        form = NewTimelineForm(request.POST)
        if form.is_valid():
            f = form.save()
            return HttpResponseRedirect('/timeline/' + str(f.id) + '/')

    all_timelines = Timeline.objects.all()[:5]

    return render_to_response('index.html',
                              {'featured_timelines': all_timelines},
                              context_instance = RequestContext(request))



def index(request,timeline_id):

    t = get_object_or_404(Timeline, pk=timeline_id)

    """
    Hidden attributes:
    id_eventType = 'instant' or 'duration'
    id_startTimeEnabled = 'True' or 'False'
    id_endTimeEnabled = 'True' or 'False'
    """
    # Check if new event form has been submitted
    # 'startTimeEnabled' is unique to this form, so this is a way to check that
    # we're not executing the following code from an outside POST call
    if request.method == 'POST' and (u'startTimeEnabled' in request.POST):
        newEvent = request.POST.copy()

        newEvent['title'] = request.POST[u'title']
        newEvent['description'] = request.POST[u'description']
        
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

        newEvent['votes'] = 0
        
        form = NewEventForm(newEvent)
        if form.is_valid():
            f = form.save(commit=False)
            f.timeline = t
            f.save()
            return HttpResponseRedirect('/timeline/' + str(t.id) + '/')
    
    all_events = t.events.all()
    json_events = create_json(all_events)

    all_tags = Tag.objects.filter(timeline=t)

    json_tags = {}

    for x in all_tags:
        txt = x.tag
        json_tags[txt] = True

    json_tags = simplejson.dumps(json_tags)

    return render_to_response('index.html',
                              {'timeline' : t,
                               'all_events' : all_events,
                               'json_events' : json_events,
                               'all_tags' : all_tags,
                               'json_tags': json_tags,
                               },
                              context_instance = RequestContext(request))

def upvote(request):
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

def tag(request):
    if request.method == 'POST':
        event_id = request.POST[u'id']
        modified_tags = simplejson.loads(request.POST[u'tag_list'])

        e = get_object_or_404(Event,pk=event_id)
        t = e.timeline

        for tag in modified_tags:
            status = modified_tags[tag]
            if status == True:
                newtag, created = Tag.objects.get_or_create(tag=tag,timeline=t)
                e.tags.add(newtag)
            elif status == False:
                tag_to_remove = Tag.objects.get(tag=tag,timeline=t)
                e.tags.remove(tag_to_remove)

        all_events = t.events.all()
        data = create_json(all_events)

        return HttpResponse(data,mimetype='application/json')
    return HttpResponse('error')

def addEvent(request):
    if request.method == 'POST':
        timeline_id = request.POST[u'id']
        t = get_object_or_404(Timeline, pk=timeline_id)
        
        newEvent = request.POST.copy()

        newEvent['title'] = request.POST[u'title']
        newEvent['description'] = request.POST[u'description']
        
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
            
            modified_tags = simplejson.loads(request.POST[u'tag_list'])

            for tag in modified_tags:
                status = modified_tags[tag]
                if status == True:
                    newtag, created = Tag.objects.get_or_create(tag=tag,timeline=t)
                    e.tags.add(newtag)
                elif status == False:
                    tag_to_remove = Tag.objects.get(tag=tag,timeline=t)
                    e.tags.remove(tag_to_remove)
            e.save()

        else:
            newEvent['votes'] = 0

            tags = simplejson.loads(request.POST[u'tags'])

            form = NewEventForm(newEvent)
            if form.is_valid():
                f = form.save(commit=False)
                f.timeline = t
                f.save()

                e = get_object_or_404(Event, pk=f.id)

                for tag in tags:
                    newtag, created = Tag.objects.get_or_create(tag=tag,timeline=t)
                    e.tags.add(newtag)
                    
        all_events = t.events.all()
        data = create_json(all_events)

        return HttpResponse(data, mimetype='application/json')

def filter(request):
    if request.method == 'POST':
        t = get_object_or_404(Timeline, pk=request.POST[u'id'])
        
        votes_filter = int(request.POST[u'votes'])
        tags_filter = simplejson.loads(request.POST[u'tag_list'])

        if votes_filter == 0 and tags_filter == {}:
            all_events = t.events.all()
            data = create_json(all_events)
        else:
            tags_id_list = []

            for text in tags_filter:
                tag_obj = Tag.objects.get(timeline=t,tag=text)
                tags_id_list.append(tag_obj.id)

            if tags_id_list:
                matches = Event.objects.filter(votes__gte=votes_filter)
                matches = matches.filter(tags__in=tags_id_list)
            else:
                matches = Event.objects.filter(votes__gte=votes_filter)

            data = create_json(matches)

        return HttpResponse(data, mimetype='application/json')
        
