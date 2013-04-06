from django.http import HttpResponse, HttpResponseRedirect
from apps.timeline.models import *
from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from apps.timeline.forms import NewTimelineForm

def index(request):
    # create a new timeline
    if request.method == 'POST':
        form = NewTimelineForm(request.POST)
        if form.is_valid():
            f = form.save()
            return HttpResponseRedirect('/timeline/' + str(f.id) + '/')

    all_timelines = Timeline.objects.all()[:5]

    return render_to_response('homepage/index.html',
                              {'featured_timelines': all_timelines},
                              context_instance = RequestContext(request))
