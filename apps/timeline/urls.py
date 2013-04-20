from django.conf.urls import patterns, url

urlpatterns = patterns('apps.timeline.views',
                       url(r'^(?P<timeline_id>[0-9]+)/$', 'index'),
                       url(r'^(?P<timeline_id>[0-9]+)/data/$', 'get_timeline_data'),
                       url(r'^(?P<timeline_id>[0-9]+)/vote/$','upvote'),
                       url(r'^(?P<timeline_id>[0-9]+)/add/$','new_event'),
                       url(r'^(?P<timeline_id>[0-9]+)/edit/$','new_event'),
                       url(r'^(?P<timeline_id>[0-9]+)/filter/$','filter'),
)
