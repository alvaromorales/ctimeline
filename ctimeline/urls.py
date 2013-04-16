from django.conf.urls import patterns, include, url
from django.contrib import admin
from accounts.forms import SignupFormExtra
from accounts.views import signup

admin.autodiscover()

urlpatterns = patterns('',
                       url(r'^admin/', include(admin.site.urls)),
                       url(r'^timeline/', include('apps.timeline.urls')),
                       url(r'^accounts/signup/$',signup, {'signup_form': SignupFormExtra}),
                       url(r'^accounts/', include('userena.urls')),
                       url(r'^$', include('apps.homepage.urls')),                       
)
