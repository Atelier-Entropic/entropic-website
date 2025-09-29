from django.urls import path
from . import views

urlpatterns = [
    # Projects live under /projects/
    path("projects/", views.project_gallery, name="project_gallery"),
    path("projects/<slug:slug>/", views.project_detail, name="project_detail"),

    # Research
    path("research/", views.research_latest, name="research"),
    path("research/<slug:slug>/", views.research_detail, name="research_detail"),
]
