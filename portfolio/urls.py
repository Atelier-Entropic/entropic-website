from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve as media_serve
from gallery.views import contact_submit

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", TemplateView.as_view(template_name="index.html"), name="home"),
    path("", include("gallery.urls")),
    path("about/",   TemplateView.as_view(template_name="about.html"),   name="about"),
    path("contact/", TemplateView.as_view(template_name="contact.html"), name="contact"),
    path("contact/submit/", contact_submit, name="contact_submit"),
]

# Dev: serve media locally
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
# Prod on Render: serve from the mounted disk (/var/images)
else:
    urlpatterns += [
        re_path(r"^images/(?P<path>.*)$", media_serve, {"document_root": settings.MEDIA_ROOT}),
    ]