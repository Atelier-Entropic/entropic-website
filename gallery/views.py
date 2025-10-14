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


# gallery/views.py

import os
import logging
import requests
from django.conf import settings
from django.contrib import messages
from django.shortcuts import redirect, render
from django.utils.html import strip_tags

logger = logging.getLogger(__name__)

def _send_via_graph(subject: str, body_text: str, to_addrs: list[str], reply_to: str | None = None):
    """
    Sends an email using Microsoft Graph (application permissions).
    Requires env vars:
      MICROSOFT_GRAPH_TENANT_ID, MICROSOFT_GRAPH_CLIENT_ID, MICROSOFT_GRAPH_CLIENT_SECRET, GRAPH_SENDER
    """
    tenant = os.environ["MICROSOFT_GRAPH_TENANT_ID"]
    client_id = os.environ["MICROSOFT_GRAPH_CLIENT_ID"]
    client_secret = os.environ["MICROSOFT_GRAPH_CLIENT_SECRET"]
    sender = os.environ["GRAPH_SENDER"]  # mailbox that will send (e.g. info@entropic.es)

    # 1) Get app-only token
    token_resp = requests.post(
        f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token",
        data={
            "client_id": client_id,
            "client_secret": client_secret,
            "grant_type": "client_credentials",
            "scope": "https://graph.microsoft.com/.default",
        },
        timeout=20,
    )
    token_resp.raise_for_status()
    access_token = token_resp.json()["access_token"]

    # 2) Compose Graph payload
    to_recipients = [{"emailAddress": {"address": addr}} for addr in to_addrs]
    payload = {
        "message": {
            "subject": subject,
            "body": {"contentType": "Text", "content": body_text},
            "toRecipients": to_recipients,
            # `from` is optional for app-only; Graph infers from /users/{sender}
            # including it is fine and explicit:
            "from": {"emailAddress": {"address": sender}},
        },
        "saveToSentItems": "true",
    }
    if reply_to:
        payload["message"]["replyTo"] = [{"emailAddress": {"address": reply_to}}]

    # 3) Send
    send_resp = requests.post(
        f"https://graph.microsoft.com/v1.0/users/{sender}/sendMail",
        headers={
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=20,
    )
    if not send_resp.ok:
        # raise a detailed error to surface in your banner/logs
        raise RuntimeError(f"Graph sendMail failed {send_resp.status_code}: {send_resp.text}")


def contact_submit(request):
    if request.method != "POST":
        return render(request, "contact.html")

    name = strip_tags((request.POST.get("name") or "").strip())
    user_email = (request.POST.get("email") or "").strip()
    subject = strip_tags((request.POST.get("subject") or "").strip())
    field_key = ((request.POST.get("field") or "").strip().lower())
    message_text = (request.POST.get("message") or "").strip()

    # Basic validation
    if not name or not user_email or not subject or not message_text:
        messages.error(request, "Please fill in all required fields.")
        return redirect("contact")
    if "@" not in user_email or "." not in user_email.split("@")[-1]:
        messages.error(request, "Please enter a valid email address.")
        return redirect("contact")

    # Decide recipients from routing
    recipient_list = settings.CONTACT_ROUTING.get(field_key, [settings.CONTACT_TO_EMAIL])
    tag = (field_key or "inquiry").upper()

    # Build final subject/body (unchanged from your version)
    full_subject = f"{getattr(settings, 'CONTACT_SUBJECT_PREFIX', '')}[{tag}] {subject} — {name}"
    body = (
        f"Name: {name}\n"
        f"Email: {user_email}\n"
        f"Purpose: {field_key or 'inquiry'}\n"
        f"Delivered to: {', '.join(recipient_list)}\n\n"
        f"Message:\n{message_text}\n"
    )

    # Send via Graph
    try:
        _send_via_graph(
            subject=full_subject,
            body_text=body,
            to_addrs=recipient_list,
            reply_to=user_email,
        )
        logger.info("Contact form sent to %s via Graph", recipient_list)
        messages.success(request, f"✅ Thanks! Your message was sent to {', '.join(recipient_list)}.")
    except Exception as e:
        logger.exception("Contact form FAILED via Graph")
        messages.error(request, f"❌ We couldn’t send your message. Error: {e}")

    return redirect("contact")
