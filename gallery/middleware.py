from django.conf import settings
from django.utils.deprecation import MiddlewareMixin

# Use your configured MEDIA_URL (e.g. "/images/")
MEDIA_PREFIX = getattr(settings, "MEDIA_URL", "/images/")

class MediaCacheHeaders(MiddlewareMixin):
    def process_response(self, request, response):
        # Only add strong cache headers in production
        if not settings.DEBUG and response.status_code == 200 and request.path.startswith(MEDIA_PREFIX):
            max_age = getattr(settings, "MEDIA_CACHE_SECONDS", 31536000)  # 1 year
            immutable = getattr(settings, "MEDIA_CACHE_IMMUTABLE", True)
            cache_control = f"public, max-age={max_age}" + (", immutable" if immutable else "")
            response["Cache-Control"] = cache_control
        return response
