// static/scripts/admin/research-admin.js
document.addEventListener("DOMContentLoaded", function () {
  // ----------------- helpers -----------------
  const MGMT_RE = /\-(TOTAL_FORMS|INITIAL_FORMS|MIN_NUM_FORMS|MAX_NUM_FORMS)$/;

  function setDisabled(scope, off) {
    if (!scope) return;
    scope.querySelectorAll("input, select, textarea, button").forEach((el) => {
      const name = el.getAttribute("name") || "";
      if (MGMT_RE.test(name)) return; // keep formset mgmt fields enabled
      off ? el.setAttribute("disabled", "disabled") : el.removeAttribute("disabled");
    });
  }
  function show(el) { if (el) { el.style.display = ""; el.removeAttribute("aria-hidden"); setDisabled(el, false); } }
  function hide(el) { if (el) { el.style.display = "none"; el.setAttribute("aria-hidden", "true"); setDisabled(el, true); } }
  function row(scope, field) {
    return scope.querySelector(`.form-row.field-${field}`) ||
           scope.querySelector(`.form-row.field__${field}`);
  }

  // Inline groups (query fresh each time)
  const getImagesInline = () =>
    document.querySelector("#researchimage_set-group") || document.querySelector("#images-group");
  const getBlocksInline = () =>
    document.querySelector("#researchblock_set-group") || document.querySelector("#blocks-group");

  // ----------------- per-block toggle -----------------
  function toggleInlineByValue(inline, val) {
    if (!inline) return;

    const rTitle = row(inline, "title");
    const rText  = row(inline, "text");
    const rI1    = row(inline, "image_1");
    const rI2    = row(inline, "image_2");
    const rI3    = row(inline, "image_3");
    const rI4    = row(inline, "image_4");

    // Hide everything first
    [rTitle, rText, rI1, rI2, rI3, rI4].forEach(hide);

    console.log("🧱 Block layout:", val);

    if (val === "layout_a") {
      show(rTitle); show(rText);
      show(rI1); show(rI2); show(rI3);
    } else if (val === "layout_b") {
      show(rTitle); show(rText);
      show(rI1);
    } else if (val === "layout_c") {
      // four images only — no title/text
      show(rI1); show(rI2); show(rI3); show(rI4);
    } else if (val === "layout_d") {
      // text only
      show(rTitle); show(rText);
    }
  }

  function initAllVisibleInlines() {
    const blkGroup = getBlocksInline();
    if (!blkGroup) return;
    blkGroup.querySelectorAll(".inline-related").forEach((inline) => {
      const sel = inline.querySelector("select[name$='-layout_type']");
      if (sel) toggleInlineByValue(inline, sel.value);
    });
  }

  function attachDelegatedChange() {
    const blkGroup = getBlocksInline();
    if (!blkGroup || blkGroup.__delegated) return;
    blkGroup.addEventListener("change", (e) => {
      const sel = e.target.closest("select[name$='-layout_type']");
      if (!sel) return;
      const inline = sel.closest(".inline-related");
      if (!inline) return;
      toggleInlineByValue(inline, sel.value);
    });
    blkGroup.__delegated = true;
  }

  function attachObserver() {
    const blkGroup = getBlocksInline();
    if (!blkGroup || blkGroup.__observerAttached) return;
    const mo = new MutationObserver((muts) => {
      muts.forEach((m) => {
        m.addedNodes.forEach((n) => {
          if (n.nodeType === 1 && n.classList.contains("inline-related")) {
            const sel = n.querySelector("select[name$='-layout_type']");
            if (sel) toggleInlineByValue(n, sel.value);
          }
        });
      });
    });
    mo.observe(blkGroup, { childList: true });
    blkGroup.__observerAttached = true;
  }

  // ----------------- article-level SHORT/LONG -----------------
  const layoutField = document.querySelector("#id_article_layout");

  function toggleArticleLayout(val) {
    const img = getImagesInline();
    const blk = getBlocksInline();
    const bodyRow =
      document.querySelector(".form-row.field-body") ||
      document.querySelector(".form-row.field__body");

    console.log("💡 Layout selected:", val);

    if (val === "long") {
      hide(img); show(blk);
      if (bodyRow) bodyRow.style.display = "none";
      // When LONG becomes active, wire everything now
      initAllVisibleInlines();
      attachDelegatedChange();
      attachObserver();
    } else {
      show(img); hide(blk);
      if (bodyRow) bodyRow.style.display = "";
    }
  }

  if (layoutField) {
    // initial + on change
    toggleArticleLayout(layoutField.value);
    layoutField.addEventListener("change", function () {
      toggleArticleLayout(this.value);
    });
  } else {
    // fallback (if the select isn't present for some reason)
    initAllVisibleInlines();
    attachDelegatedChange();
    attachObserver();
  }
});
