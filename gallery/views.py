from django.shortcuts import render, get_object_or_404
from .models import Project

def project_gallery(request):
    # ✅ Explicitly order by drag‑and‑drop order field
    projects = Project.objects.order_by('order')
    return render(request, 'projects.html', {'projects': projects})


def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)

    # ✅ Also order related projects by drag‑and‑drop order
    related_projects = (
        Project.objects
        .filter(category=project.category)
        .exclude(id=project.id)
        .order_by('order')[:3]  # Limit to 3 suggestions
    )

    return render(request, "project_detail.html", {
        "project": project,
        "related_projects": related_projects,
    })

# gallery/views.py
from django.shortcuts import get_object_or_404, render, redirect
from .models import ResearchArticle

def research_latest(request):
    qs = (
        ResearchArticle.objects
        .filter(is_published=True)
        .prefetch_related("images")
        .order_by("-created_at", "-id")  # newest first
    )
    articles = list(qs)
    total = len(articles)
    # latest (top) should have the highest number
    for i, a in enumerate(articles):
        a.display_index = total - i        # int, e.g. 7, 6, 5...
        a.display_index_2d = f"{a.display_index:02d}"  # "07", "06", ...
    return render(request, "research.html", {"articles": articles})


def research_detail(request, slug):
    qs = ResearchArticle.objects.filter(is_published=True)
    article = get_object_or_404(qs.prefetch_related("images"), slug=slug)
    articles = qs.only("id", "title", "slug", "sidebar_order")
    return render(request, "research.html", {"article": article, "articles": articles})
