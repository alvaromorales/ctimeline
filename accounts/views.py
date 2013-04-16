from django.shortcuts import render_to_response, get_object_or_404
from django.template import RequestContext
from userena.views import signup as usarena_signup

def signup(request,signup_form):
    return usarena_signup(request,signup_form,template_name='accounts/signup_form.html')
