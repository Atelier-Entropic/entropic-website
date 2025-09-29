from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    # REAL Home (index page)
    path("", TemplateView.as_view(template_name="index.html"), name="home"),

    # App routes (projects/research)
    path("", include("gallery.urls")),

    # Static pages
    path("about/",   TemplateView.as_view(template_name="about.html"),   name="about"),
    path("contact/", TemplateView.as_view(template_name="contact.html"), name="contact"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
