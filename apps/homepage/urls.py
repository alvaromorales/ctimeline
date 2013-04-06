from django.conf.urls import patterns, url

urlpatterns = patterns('apps.homepage.views',
    url(r'^$', 'index', name='index')
)
