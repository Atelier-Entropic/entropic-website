# gallery/middleware.py
from django.conf import settings

def media_cache_headers(get_response):
    """Add strong cache headers to MEDIA responses in production."""
    media_prefix = getattr(settings, "MEDIA_URL", "/images/")
    max_age = int(getattr(settings, "MEDIA_CACHE_SECONDS", 31536000))
    immutable = getattr(settings, "MEDIA_CACHE_IMMUTABLE", True)

    def middleware(request):
        response = get_response(request)
        if (
            not settings.DEBUG
            and response.status_code == 200
            and request.path.startswith(media_prefix)
        ):
            parts = [f"public, max-age={max_age}"]
            if immutable:
                parts.append("immutable")
            response["Cache-Control"] = ", ".join(parts)
        return response

    return middleware
