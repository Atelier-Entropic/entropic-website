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
# (Set these in Render → Environment)
# ---------------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-me")
DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

# Comma-separated list in env, e.g. "entropic-website.onrender.com,localhost,127.0.0.1"
ALLOWED_HOSTS = [h for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h]

# For Render URL, put full https origin(s) here, comma-separated
# Example: "https://entropic-website.onrender.com"
CSRF_TRUSTED_ORIGINS = [o for o in os.environ.get("CSRF_TRUSTED_ORIGINS", "").split(",") if o]

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
    # your apps
    "gallery",
    "adminsortable2",
]

# ---------------------------
# Middleware (WhiteNoise added)
# ---------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # "whitenoise.middleware.WhiteNoiseMiddleware",  # serve static files on Render
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "portfolio.urls"

# ---------------------------
# Templates
# ---------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  # your /templates folder
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
# Default: SQLite (works out of the box)
# If you later add a Postgres on Render, set DATABASE_URL in env.
# ---------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Try using dj-database-url if DATABASE_URL exists (optional, safe if package present)
if os.environ.get("DATABASE_URL"):
    try:
        import dj_database_url

        DATABASES["default"] = dj_database_url.config(
            default=os.environ["DATABASE_URL"],
            conn_max_age=600,
        )
    except Exception:
        # Falls back to SQLite if package not installed
        pass

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
# Static files (Render + WhiteNoise)
# ---------------------------
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "static"]  # keep if you have /static in your repo
STATIC_ROOT = BASE_DIR / "staticfiles"    # collectstatic target on Render

# Compressed files & cache-busting
# STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# ---------------------------
# Media files (your images/)
# ---------------------------
MEDIA_URL = "/images/"
MEDIA_ROOT = BASE_DIR / "images"

# ---------------------------
# Default primary key
# ---------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Local dev: turn debug on
DEBUG = True

# Allow local hosts
ALLOWED_HOSTS = ["127.0.0.1", "localhost"]

# (optional but helpful for admin/login locally)
CSRF_TRUSTED_ORIGINS = ["http://127.0.0.1:8000", "http://localhost:8000"]

# remove this line from the hard-coded list:
# "whitenoise.middleware.WhiteNoiseMiddleware",

# Keep your MIDDLEWARE without WhiteNoise, then add this block **below** it:
if not DEBUG:
    MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")

# Storage: use WhiteNoise only in prod
if DEBUG:
    STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"
else:
    STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
