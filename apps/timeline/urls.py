from django.conf.urls import patterns, url

urlpatterns = patterns('apps.timeline.views',
                       url(r'^(?P<timeline_id>[0-9]+)/$', 'index'),
                       url(r'^vote/$','upvote'),
                       url(r'^addevent/$','addEvent'),
                       url(r'^tag/$','tag'),
                       url(r'^editevent/$','addEvent'),
                       url(r'^filter/$','filter'),
)
