"""
Django settings for portfolio project (Render-ready).
Django 5.x
"""

from pathlib import Path
import os

# ---------------------------
# Paths
# ---------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# ---------------------------
# Core security & debug
# - Locally: DEBUG defaults to True so runserver “just works”
# - On Render: set env vars in the dashboard
#   DEBUG=False, SECRET_KEY=..., ALLOWED_HOSTS=..., CSRF_TRUSTED_ORIGINS=...
# ---------------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
DEBUG = os.environ.get("DEBUG", "True").lower() == "true"

if DEBUG:
    ALLOWED_HOSTS = ["127.0.0.1", "localhost"]
    CSRF_TRUSTED_ORIGINS = ["http://127.0.0.1:8000", "http://localhost:8000"]
else:
    # Comma-separated in env (no spaces): "entropic-website.onrender.com,yourdomain.com,www.yourdomain.com"
    ALLOWED_HOSTS = [h for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h]
    # Comma-separated full origins: "https://entropic-website.onrender.com,https://yourdomain.com,https://www.yourdomain.com"
    CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o]
    # Required behind Render's proxy so Django knows it's HTTPS
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
    # Secure cookies in production
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# ---------------------------
# Applications
# ---------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "anymail",
    "gallery",
    "adminsortable2",
]

# ---------------------------
# Middleware (WhiteNoise only in production)
# ---------------------------
MIDDLEWARE = [
    "gallery.middleware.media_cache_headers",
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise gets inserted below when not DEBUG
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

if not DEBUG:
    MIDDLEWARE.insert(2, "whitenoise.middleware.WhiteNoiseMiddleware")

ROOT_URLCONF = "portfolio.urls"

# ---------------------------
# Templates
# ---------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "portfolio.wsgi.application"

# ---------------------------
# Database
# - Local default: SQLite
# - If DATABASE_URL is set (Render Postgres), use it
# ---------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

if os.environ.get("DATABASE_URL"):
    try:
        import dj_database_url
        DATABASES["default"] = dj_database_url.config(
            default=os.environ["DATABASE_URL"],
            conn_max_age=600,
        )
    except Exception:
        pass  # fall back to SQLite if package not installed

# ---------------------------
# Password validation
# ---------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ---------------------------
# Internationalization
# ---------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ---------------------------
# Static & Media
# ---------------------------
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]       # project /static (optional)
STATIC_ROOT = BASE_DIR / "staticfiles"         # collectstatic target (Render)

if DEBUG:
    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"
else:
    STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = "/images/"
MEDIA_ROOT = os.environ.get("MEDIA_ROOT", str(BASE_DIR / "images"))
MEDIA_CACHE_SECONDS = int(os.environ.get("MEDIA_CACHE_SECONDS", "31536000"))  # 1 year
MEDIA_CACHE_IMMUTABLE = os.environ.get("MEDIA_CACHE_IMMUTABLE", "true").lower() == "true"

# ---------------------------
# Default primary key
# ---------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ===========================
# Email via Outlook / M365
# ===========================

# What shows in the recipient’s inbox as the sender
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", "ENTROPIC <info@entropic.es>")

# Fallback recipient if the dropdown value is missing/unknown
CONTACT_TO_EMAIL = os.environ.get("CONTACT_TO_EMAIL", "info@entropic.es")

# Route by <select name="field"> value (lowercase keys)
# Make sure your HTML uses these values: collaborate, join, press, competition, other
CONTACT_ROUTING = {
    "collaborate": ["info@entropic.es"],
    "join": ["join@entropic.es"],
    "press": ["press@entropic.es"],
    "competition": ["info@entropic.es"],
    "other": ["info@entropic.es"],
}

# Subject prefix (optional, keeps your inbox tidy)
CONTACT_SUBJECT_PREFIX = os.environ.get("CONTACT_SUBJECT_PREFIX", "[Website] ")

CONTACT_FROM_MODE = os.environ.get("CONTACT_FROM_MODE", "single")

