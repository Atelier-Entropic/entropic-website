from django.contrib import admin
from adminsortable2.admin import SortableAdminMixin
from .models import Project, ProjectGalleryImage
from django import forms  # <-- REQUIRED


class ProjectGalleryImageInline(admin.TabularInline):
    model = ProjectGalleryImage
    extra = 1

@admin.register(Project)
class ProjectAdmin(SortableAdminMixin,admin.ModelAdmin):
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProjectGalleryImageInline]

    # Group fields in tabs
    fieldsets = (
        ('Gallery Info', {
            'fields': (
                'title', 'slug', 'category', 'location', 'orientation',
                'image_main', 'image_alt1', 'image_alt2','short_description',
            )
        }),
        ("Project Page Info", {
            "fields": (
                "intro_text", 
                "intro_image",
                "slideshow_1", "slideshow_2", "slideshow_3",
                "description", "program", "size", "country", "client", 'collaborators', "team", "year",
            ),
        }),
    )

    list_display = ("title", "category", "location", "orientation", 'order')
    list_filter = ("category", "location", "orientation")
    search_fields = ("title", "slug", "short_description")

# admin.py
from django import forms
from django.contrib import admin
from .models import ResearchArticle, ResearchImage, ResearchBlock
from django.forms.models import BaseInlineFormSet
from django.core.exceptions import ValidationError

class ResearchImageInlineFormSet(BaseInlineFormSet):
    def clean(self):
        super().clean()
        if getattr(self.instance, "article_layout", "") == "short":
            count = sum(
                1 for f in self.forms
                if not f.cleaned_data.get("DELETE") and f.cleaned_data.get("image")
            )
            if count < 1:
                raise ValidationError("Short layout needs at least 1 image.")
            if count > 4:
                raise ValidationError("Short layout supports up to 4 images.")

# --- Article form (simple passthrough) ---
class ResearchArticleForm(forms.ModelForm):
    class Meta:
        model = ResearchArticle
        fields = "__all__"

# --- Block form (explicitly include all 4 images) ---
class ResearchBlockForm(forms.ModelForm):
    class Meta:
        model = ResearchBlock
        fields = (
            "layout_type",
            "title", "text",
            "image_1", "image_2", "image_3", "image_4",
            "position",
        )

class ResearchBlockInline(admin.StackedInline):
    model = ResearchBlock
    form = ResearchBlockForm
    extra = 0
    fieldsets = (
        (None, {"fields": ("layout_type", "title", "text")}),
        ("Images", {"fields": ("image_1", "image_2", "image_3", "image_4")}),
        ("Order", {"fields": ("position",)}),
    )
    ordering = ("position",)
    verbose_name_plural = "Research Blocks"

class ResearchImageInline(admin.TabularInline):
    model = ResearchImage
    extra = 0
    fields = ("image", "alt", "caption", "position")
    ordering = ("position",)
    verbose_name_plural = "Images (Short Layout Only)"

@admin.register(ResearchArticle)
class ResearchArticleAdmin(admin.ModelAdmin):
    form = ResearchArticleForm
    list_display = ("title", "article_layout", "sidebar_order", "is_published")
    list_filter = ("is_published", "article_layout")
    search_fields = ("title", "subtitle", "body")  # 'date' doesn't exist in the model
    prepopulated_fields = {"slug": ("title",)}
    ordering = ("sidebar_order",)
    inlines = [ResearchImageInline, ResearchBlockInline]

    class Media:
        js = ["scripts/admin/research-admin.js"]
