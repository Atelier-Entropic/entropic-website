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


from django.conf import settings
from django.contrib import messages
from django.core.mail import EmailMessage
from django.shortcuts import redirect, render, get_object_or_404
from django.utils.html import strip_tags

def contact_submit(request):
    if request.method != "POST":
        # if someone visits this URL directly, just show the contact page
        return render(request, "contact.html")

    name = strip_tags((request.POST.get("name") or "").strip())
    user_email = (request.POST.get("email") or "").strip()
    subject = strip_tags((request.POST.get("subject") or "").strip())
    field_key = ((request.POST.get("field") or "").strip().lower())
    message_text = (request.POST.get("message") or "").strip()

    if not name or not user_email or not subject or not message_text:
        messages.error(request, "Please fill in all required fields.")
        return redirect("contact")
    if "@" not in user_email or "." not in user_email.split("@")[-1]:
        messages.error(request, "Please enter a valid email address.")
        return redirect("contact")

    recipient_list = settings.CONTACT_ROUTING.get(field_key, [settings.CONTACT_TO_EMAIL])
    tag = (field_key or "inquiry").upper()

    from_email = settings.DEFAULT_FROM_EMAIL
    if getattr(settings, "CONTACT_FROM_MODE", "single") == "match_selection":
        from_email = recipient_list[0]

    full_subject = f"{getattr(settings, 'CONTACT_SUBJECT_PREFIX', '')}[{tag}] {subject} — {name}"
    body = (
        f"Name: {name}\n"
        f"Email: {user_email}\n"
        f"Purpose: {field_key or 'inquiry'}\n"
        f"Delivered to: {', '.join(recipient_list)}\n\n"
        f"Message:\n{message_text}\n"
    )

    try:
        EmailMessage(
            subject=full_subject,
            body=body,
            from_email=from_email,
            to=recipient_list,
            headers={"Reply-To": user_email},
        ).send(fail_silently=False)
    except Exception:
        messages.error(request, "Sorry, we couldn’t send your message right now.")
        return redirect("contact")

    messages.success(request, "Thanks! Your message has been sent.")
    return redirect("contact")
