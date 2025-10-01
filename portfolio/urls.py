from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.views.static import serve as media_serve

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", TemplateView.as_view(template_name="index.html"), name="home"),
    path("", include("gallery.urls")),
    path("about/",   TemplateView.as_view(template_name="about.html"),   name="about"),
    path("contact/", TemplateView.as_view(template_name="contact.html"), name="contact"),
]

# Serve MEDIA in production (TEMPORARY until you switch to Azure)
# Either `path(...)` or `re_path(...)` works — pick one.

# Option A (path)
urlpatterns += [
    path("images/<path:path>", media_serve, {"document_root": settings.MEDIA_ROOT}),
]

# Option B (regex)
# urlpatterns += [
#     re_path(r"^images/(?P<path>.*)$", media_serve, {"document_root": settings.MEDIA_ROOT}),
# ]
