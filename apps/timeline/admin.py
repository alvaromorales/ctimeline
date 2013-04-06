from django.contrib import admin
from models import Timeline, Event

class EventInline(admin.StackedInline):
    model = Event
    extra = 3

class TimelineAdmin(admin.ModelAdmin):
    fields = ['title', 'description']
    inlines = [EventInline]

admin.site.register(Timeline, TimelineAdmin)
