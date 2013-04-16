from django.db import models
from django.contrib.auth.models import User  
from django.utils.translation import ugettext as _  
from userena.models import UserenaBaseProfile
from apps.timeline.models import Timeline
  
class UserProfile(UserenaBaseProfile):  
    user = models.OneToOneField(User,unique=True,  
                        verbose_name=_('user'),related_name='user_profile')

    follows_timelines = models.ManyToManyField(Timeline,
                                                related_name='followedTimelines')
