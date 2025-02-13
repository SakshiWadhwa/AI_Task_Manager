from django.urls import path
from .views import user_register, user_login, user_logout, user_profile

urlpatterns = [
    path('register/', user_register, name='user_register'),
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),

    path('profile/', user_profile, name='user-profile'),
]
