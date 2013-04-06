from django.forms import ModelForm
from models import Timeline, Event

class NewTimelineForm(ModelForm):
    class Meta:
        model = Timeline

class NewEventForm(ModelForm):
    class Meta:
        model = Event
        exclude = ('timeline')
