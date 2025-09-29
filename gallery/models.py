from django.db import models

class Project(models.Model):
    ORIENTATION_CHOICES = [
        ('horizontal', 'Horizontal'),
        ('vertical', 'Vertical'),
    ]
    CATEGORY_CHOICES = [
        ('public', 'Public'),
        ('commercial', 'Commercial'),
        ('residential', 'Residential'),
        ('landmark', 'Landmark'),
        ('urbanism', 'Urbanism'),
    ]
    LOCATION_CHOICES = [
        ('scandinavia', 'Scandinavia'),
        ('central-europe', 'Central Europe'),
        ('baltic', 'Baltic Countries'),
        ('eastern-europe', 'Eastern Europe'),
        ('middle-east', 'Middle East'),
    ]

    title = models.CharField(max_length=255)
    short_description = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(unique=True)
    orientation = models.CharField(max_length=10, choices=ORIENTATION_CHOICES)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES)
    image_main = models.ImageField(upload_to='projects/')
    image_alt1 = models.ImageField(upload_to='projects/', blank=True, null=True)
    image_alt2 = models.ImageField(upload_to='projects/', blank=True, null=True)

    # Intro
    intro_text = models.TextField(blank=True)
    intro_image = models.ImageField(upload_to='projects/intro/', blank=True, null=True)
    

    # Fullscreen slideshow
    slideshow_1 = models.ImageField(upload_to='projects/slideshow/', blank=True, null=True)
    slideshow_2 = models.ImageField(upload_to='projects/slideshow/', blank=True, null=True)
    slideshow_3 = models.ImageField(upload_to='projects/slideshow/', blank=True, null=True)

    # Main info
    description = models.TextField(blank=True)
    program = models.CharField(max_length=255, blank=True)
    size = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=255, blank=True)
    client = models.CharField(max_length=255, blank=True)
    team = models.TextField(blank=True)
    
    collaborators = models.TextField(
        blank=True,  # ✅ allows the field to be left empty in forms/admin
        null=True    # ✅ allows NULL in the database
    )
    
    year = models.CharField(max_length=10, blank=True)

    
    order = models.PositiveIntegerField(default=0, blank=False, null=False)  # 👈 for sorting

    class Meta:
        ordering = ['order']  # 👈 Default query order by drag-and-drop
 

    def __str__(self):
        return self.title

class ProjectGalleryImage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='gallery_images')
    image = models.ImageField(upload_to='projects/gallery/')
    caption = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.project.title} - {self.caption or 'Gallery Image'}"  


from django.db import models
from django.utils.text import slugify

class ResearchArticle(models.Model):
    LAYOUT_CHOICES = (
        ("short", "Short layout"),
        ("long", "Long layout"),
    )

    # Sidebar / identity
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    sidebar_order = models.PositiveIntegerField(default=1)

    # Header
    index_number = models.CharField(max_length=4, default="01")
    date = models.CharField(max_length=240, blank=True)

    # Body
    body = models.TextField(blank=True)

    # Layout choice
    article_layout = models.CharField(
        max_length=10,
        choices=LAYOUT_CHOICES,
        default="short"
    )

    # Meta
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sidebar_order", "-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)[:220]
        super().save(*args, **kwargs)

    @property
    def body_paragraphs(self):
        chunks = [p.strip() for p in self.body.split("\n\n")]
        return [p for p in chunks if p]

# models.py
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _

class ResearchBlock(models.Model):
    LAYOUT_CHOICES = (
        ("layout_a", "A · Hero + two small"),
        ("layout_b", "B · Single hero"),
        ("layout_c", "C · Four in a row"),
        ("layout_d", "D · Text only"),
    )

    article   = models.ForeignKey("ResearchArticle", on_delete=models.CASCADE, related_name="blocks")
    layout_type = models.CharField(max_length=20, choices=LAYOUT_CHOICES, default="layout_b")

    # Content
    title = models.CharField(max_length=255, blank=True, null=True)
    text  = models.TextField(blank=True, null=True)

    # Images (use only those required by the chosen layout)
    image_1 = models.ImageField(upload_to="research/", blank=True, null=True, help_text="Primary / hero")
    image_2 = models.ImageField(upload_to="research/", blank=True, null=True, help_text="Secondary")
    image_3 = models.ImageField(upload_to="research/", blank=True, null=True, help_text="Tertiary")
    image_4 = models.ImageField(upload_to="research/", blank=True, null=True, help_text="Quaternary")

    position = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.article.title} – block {self.position} ({self.layout_type})"

    def clean(self):
        """Enforce the correct image counts per layout."""
        required = []
        forbidden = []

        if self.layout_type == "layout_a":
            required = ["image_1"]                 # hero required
            # thumbs optional but recommended: image_2, image_3
        elif self.layout_type == "layout_b":
            required = ["image_1"]                 # single hero
            forbidden = ["image_2", "image_3", "image_4"]
        elif self.layout_type == "layout_c":
            required = ["image_1", "image_2", "image_3", "image_4"]  # four-up row
        elif self.layout_type == "layout_d":
            forbidden = ["image_1", "image_2", "image_3", "image_4"] # text only

        errors = {}

        # missing required
        for field in required:
            if not getattr(self, field):
                errors[field] = _("This image is required for the selected layout.")

        # forbid extras for D and B
        for field in forbidden:
            if getattr(self, field):
                errors[field] = _("Remove this image for the selected layout.")

        if errors:
            raise ValidationError(errors)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.article.title} – block {self.position}"
 

class ResearchImage(models.Model):
    article = models.ForeignKey(
        ResearchArticle, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="research/")
    alt = models.CharField(max_length=200, blank=True)
    caption = models.CharField(max_length=240, blank=True)
    position = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ["position", "id"]

    def __str__(self):
        return f"{self.article.title} — image {self.position}"

