from django.db import models
from taggit.managers import TaggableManager

class Timeline(models.Model):    
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500)
    # category
    # image
    
    def __unicode__(self):
        return self.title

class Event(models.Model):
    timeline = models.ForeignKey(Timeline, related_name='events')
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=500)

    startDate = models.DateField()
    startTime = models.TimeField(null=True, blank=True)
    endDate = models.DateField(null=True, blank=True)
    endTime = models.TimeField(null=True, blank=True)
    # latestStart = models.DateTimeField(blank=True)
    # latestEnd = models.DateTimeField(blank=True)
    durationEvent = models.BooleanField()
    votes = models.PositiveIntegerField(default=0)
    tags = TaggableManager()
    # icon
    # image
    # tags
    
    def __unicode__(self):
        return self.title
