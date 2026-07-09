const compare = () => {
  const compareBtns = [
    document.getElementById("compare-btn"),
    document.getElementById("header-compare-btn"),
  ].filter(Boolean);
  const compareInputs = document.querySelectorAll('input[name="compare"]');
  const projectList = document.getElementById("projects-list");

  if (!compareBtns.length || !compareInputs.length || !projectList) return;

  let compareMode = false;
  let checkedQuantity = 0;

  const setBtnsText = (text) => {
    compareBtns.forEach((btn) => {
      btn.innerText = text;
    });
  };

  const enterCompareMode = () => {
    compareMode = true;
    projectList.classList.add("compare-mode");
    setBtnsText("показать все");
  };

  const exitCompareMode = () => {
    compareMode = false;
    projectList.classList.remove("compare-mode");
    setBtnsText(`сравнить ${checkedQuantity}`);
  };

  compareBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (compareMode) {
        compareInputs.forEach((input) => {
          input.checked = false;
        });
        checkedQuantity = 0;
        exitCompareMode();
      } else {
        enterCompareMode();
      }
    });
  });

  compareInputs.forEach((input) => {
    input.addEventListener("change", () => {
      checkedQuantity += input.checked ? 1 : -1;

      if (compareMode) {
        if (checkedQuantity <= 0) {
          checkedQuantity = 0;
          exitCompareMode();
        }
      } else {
        setBtnsText(`сравнить ${checkedQuantity}`);
      }
    });
  });
};

const roomTypeFilter = () => {
  const all = document.getElementById("all");
  const types = document.querySelectorAll('input[name="roomtype"]:not(#all)');

  if (!all || !types.length) return;

  const rangeInputs = document.querySelectorAll(".range-input");

  const anyRangeActive = () =>
    Array.from(rangeInputs).some((input) =>
      input.classList.contains("range-input-min")
        ? +input.value > +input.min
        : +input.value < +input.max,
    );

  const refreshAll = () => {
    const anyType = Array.from(types).some((i) => i.checked);
    all.checked = !anyType && !anyRangeActive();
  };

  all.addEventListener("change", () => {
    if (all.checked) {
      types.forEach((input) => {
        input.checked = false;
      });
      rangeInputs.forEach((input) => {
        input.value = input.classList.contains("range-input-min")
          ? input.min
          : input.max;
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    } else {
      all.checked = true;
    }
  });

  types.forEach((input) => {
    input.addEventListener("change", refreshAll);
  });
  rangeInputs.forEach((input) => {
    input.addEventListener("input", refreshAll);
  });
};

const scrollUp = () => {
  const upBtn = document.getElementById("scrollup");

  if (!upBtn) return;

  upBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  });
};

const dualRangeSlider = () => {
  document.querySelectorAll(".range").forEach((range) => {
    const minInput = range.querySelector(".range-input-min");
    const maxInput = range.querySelector(".range-input-max");
    const minVal = range.querySelector(".range-val-min");
    const maxVal = range.querySelector(".range-val-max");

    if (!minInput || !maxInput) return;

    const update = () => {
      let low = parseInt(minInput.value);
      let high = parseInt(maxInput.value);

      if (low > high) {
        minInput.value = high;
        maxInput.value = low;
        [low, high] = [high, low];
      }

      minVal.textContent = low;
      maxVal.textContent = high;

      const isActive =
        low > parseInt(minInput.min) || high < parseInt(maxInput.max);
      range.classList.toggle("active", isActive);

      if (low >= parseInt(minInput.max)) {
        minInput.style.zIndex = 5;
        maxInput.style.zIndex = 4;
      } else {
        minInput.style.zIndex = 4;
        maxInput.style.zIndex = 5;
      }
    };

    minInput.addEventListener("input", update);
    maxInput.addEventListener("input", update);
    update();
  });
};

const projectViewTabs = () => {
  const photoBtn = document.getElementById("photo-btn");
  const planBtn = document.getElementById("plan-btn");
  const imagesList = document.querySelector(".images-list");

  if (!photoBtn || !planBtn || !imagesList) return;

  const showView = (view) => {
    imagesList.classList.toggle("view-photo", view === "photo");
    imagesList.classList.toggle("view-plan", view === "plan");

    photoBtn.classList.toggle("active", view === "photo");
    planBtn.classList.toggle("active", view === "plan");
  };

  photoBtn.addEventListener("click", () => showView("photo"));
  planBtn.addEventListener("click", () => showView("plan"));

  showView(photoBtn.classList.contains("active") ? "photo" : "plan");
};

const relatedSlider = () => {
  const track = document.querySelector(".related-list");
  const btns = document.querySelectorAll(".related-slider-btn");

  if (!track || btns.length < 2) return;

  const slides = Array.from(track.children);
  if (!slides.length) return;

  const [prevBtn, nextBtn] = btns;
  let index = 0;

  const metrics = () => {
    const slideWidth = slides[0].getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return { slideWidth, gap, step: slideWidth + gap };
  };

  const visibleCount = () => {
    const { slideWidth, gap, step } = metrics();
    if (!slideWidth) return 1;
    const trackWidth = track.getBoundingClientRect().width;
    return Math.max(1, Math.round((trackWidth + gap) / step));
  };

  const maxIndex = () => Math.max(0, slides.length - visibleCount());

  const update = () => {
    index = Math.min(index, maxIndex());
    track.style.transform = `translateX(-${index * metrics().step}px)`;
    prevBtn.disabled = index <= 0;
    nextBtn.disabled = index >= maxIndex();
  };

  prevBtn.addEventListener("click", () => {
    index = Math.max(0, index - 1);
    update();
  });

  nextBtn.addEventListener("click", () => {
    index = Math.min(maxIndex(), index + 1);
    update();
  });

  const viewport = document.querySelector(".related-viewport") || track;
  const DRAG_THRESHOLD = 5;
  let dragging = false;
  let pointerId = null;
  let startX = 0;
  let startTx = 0;
  let moved = false;

  const currentTx = () => -index * metrics().step;

  const onDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragging = true;
    moved = false;
    pointerId = e.pointerId;
    startX = e.clientX;
    startTx = currentTx();
    track.style.transition = "none";
    viewport.setPointerCapture?.(e.pointerId);
  };

  const onMove = (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) moved = true;
    track.style.transform = `translateX(${startTx + dx}px)`;
  };

  const onUp = (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    dragging = false;
    pointerId = null;
    track.style.transition = "";
    const dx = e.clientX - startX;
    const threshold = metrics().slideWidth * 0.25 || 40;
    if (dx <= -threshold) index = Math.min(maxIndex(), index + 1);
    else if (dx >= threshold) index = Math.max(0, index - 1);
    update();
  };

  viewport.addEventListener("pointerdown", onDown);
  viewport.addEventListener("pointermove", onMove);
  ["pointerup", "pointercancel"].forEach((type) =>
    viewport.addEventListener(type, onUp),
  );

  viewport.addEventListener(
    "click",
    (e) => {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    },
    true,
  );

  window.addEventListener("resize", update);
  update();
};

const sliderZoom = () => {
  const container = document.querySelector(".container");
  const imagesList = document.querySelector(".images-list");
  if (!container || !imagesList) return;

  const MAX_SCALE = 4;
  const DOUBLE_TAP_SCALE = 2.5;
  const TAP_MOVE = 10;
  const TAP_TIME = 300;
  const DOUBLE_TAP_GAP = 300;
  const SWIPE_THRESHOLD = 40;

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let startScale = 1;
  let startDist = 0;
  let startMidX = 0;
  let startMidY = 0;
  let startTx = 0;
  let startTy = 0;
  let startPanX = 0;
  let startPanY = 0;
  let gestureStartX = 0;
  let gestureStartY = 0;
  let gestureStartTime = 0;
  let maxPointers = 0;
  let lastTapTime = 0;
  let lastTapX = 0;
  let lastTapY = 0;
  let controlsTimer = null;
  let tapTimer = null;
  const pointers = new Map();

  const viewer = imagesList.closest(".main-content") || imagesList;
  const activeImg = () => imagesList.querySelector("li.active img");
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const inFullscreen = () => container.classList.contains("fullscreen");

  const toLocal = (dx, dy) => ({ x: dx, y: dy });

  const points = () => [...pointers.values()];
  const dist = (a, b) =>
    Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  const clampPan = () => {
    const img = activeImg();
    if (!img) return;
    const maxX = Math.max(
      0,
      (img.offsetWidth * scale - viewer.clientWidth) / 2,
    );
    const maxY = Math.max(
      0,
      (img.offsetHeight * scale - viewer.clientHeight) / 2,
    );
    tx = clamp(tx, -maxX, maxX);
    ty = clamp(ty, -maxY, maxY);
  };

  const apply = () => {
    const img = activeImg();
    if (img)
      img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    container.classList.toggle("is-zoomed", scale > 1);
  };

  const reset = () => {
    scale = 1;
    tx = 0;
    ty = 0;
    pointers.clear();
    clearTimeout(tapTimer);
    tapTimer = null;
    container.classList.remove("is-zoomed");
    imagesList
      .querySelectorAll("li img")
      .forEach((img) => (img.style.transform = ""));
  };

  const setControls = (visible, autoHide) => {
    clearTimeout(controlsTimer);
    container.classList.toggle("controls-visible", visible);
    if (visible && autoHide) {
      controlsTimer = setTimeout(
        () => container.classList.remove("controls-visible"),
        1000,
      );
    }
  };

  const toggleControls = () =>
    setControls(!container.classList.contains("controls-visible"), false);

  const toggleZoom = (x, y) => {
    const img = activeImg();
    if (!img) return;
    if (scale > 1) {
      scale = 1;
      tx = 0;
      ty = 0;
    } else {
      const rect = img.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      scale = DOUBLE_TAP_SCALE;
      tx = (x - cx) * (1 - scale);
      ty = (y - cy) * (1 - scale);
      clampPan();
      setControls(false);
    }
    apply();
  };

  const handleTap = (x, y) => {
    const now = Date.now();
    if (
      now - lastTapTime < DOUBLE_TAP_GAP &&
      Math.hypot(x - lastTapX, y - lastTapY) < 30
    ) {
      clearTimeout(tapTimer);
      tapTimer = null;
      lastTapTime = 0;
      toggleZoom(x, y);
    } else {
      lastTapTime = now;
      lastTapX = x;
      lastTapY = y;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        tapTimer = null;
        if (scale === 1) toggleControls();
      }, DOUBLE_TAP_GAP);
    }
  };

  const onDown = (e) => {
    if (e.pointerType !== "touch" || !inFullscreen()) return;
    if (pointers.size === 0) {
      gestureStartX = e.clientX;
      gestureStartY = e.clientY;
      gestureStartTime = Date.now();
      maxPointers = 0;
    }
    pointers.set(e.pointerId, e);
    maxPointers = Math.max(maxPointers, pointers.size);

    if (pointers.size === 2) {
      const [a, b] = points();
      startDist = dist(a, b);
      startScale = scale;
      startMidX = (a.clientX + b.clientX) / 2;
      startMidY = (a.clientY + b.clientY) / 2;
      startTx = tx;
      startTy = ty;
    } else if (pointers.size === 1) {
      startPanX = e.clientX;
      startPanY = e.clientY;
      startTx = tx;
      startTy = ty;
    }
  };

  const onMove = (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);

    if (pointers.size === 2) {
      const [a, b] = points();
      if (startDist > 0) {
        scale = clamp(startScale * (dist(a, b) / startDist), 1, MAX_SCALE);
      }
      const mx = (a.clientX + b.clientX) / 2;
      const my = (a.clientY + b.clientY) / 2;
      const local = toLocal(mx - startMidX, my - startMidY);
      tx = startTx + local.x;
      ty = startTy + local.y;
      if (scale <= 1) {
        tx = 0;
        ty = 0;
      }
      clampPan();
      apply();
      e.preventDefault();
    } else if (pointers.size === 1 && scale > 1) {
      const local = toLocal(e.clientX - startPanX, e.clientY - startPanY);
      tx = startTx + local.x;
      ty = startTy + local.y;
      clampPan();
      apply();
      e.preventDefault();
    }
  };

  const onUp = (e) => {
    if (e.pointerType !== "touch" || !inFullscreen()) {
      pointers.delete(e.pointerId);
      return;
    }
    const endX = e.clientX;
    const endY = e.clientY;
    pointers.delete(e.pointerId);

    if (pointers.size > 0) {
      if (pointers.size === 1) {
        const [p] = points();
        startPanX = p.clientX;
        startPanY = p.clientY;
        startTx = tx;
        startTy = ty;
      }
      return;
    }

    const dx = endX - gestureStartX;
    const dy = endY - gestureStartY;
    const dt = Date.now() - gestureStartTime;
    const moved = Math.hypot(dx, dy);

    if (maxPointers >= 2) {
    } else if (moved < TAP_MOVE && dt < TAP_TIME) {
      handleTap(endX, endY);
    } else if (
      scale === 1 &&
      Math.abs(dx) > SWIPE_THRESHOLD &&
      Math.abs(dx) > Math.abs(dy)
    ) {
      imagesList.dispatchEvent(
        new CustomEvent(dx < 0 ? "slidenext" : "slideprev"),
      );
    }

    if (scale <= 1) {
      tx = 0;
      ty = 0;
      apply();
    }
    maxPointers = 0;
  };

  imagesList.addEventListener("pointerdown", onDown);
  imagesList.addEventListener("pointermove", onMove, { passive: false });
  ["pointerup", "pointercancel"].forEach((type) =>
    imagesList.addEventListener(type, onUp),
  );

  imagesList.addEventListener("slidechange", reset);

  imagesList.addEventListener("fsenter", () => setControls(true, true));

  ["gesturestart", "gesturechange", "gestureend"].forEach((type) =>
    document.addEventListener(type, (e) => e.preventDefault()),
  );
};

const fullscreenSlider = () => {
  const container = document.querySelector(".container");
  const imagesList = document.querySelector(".images-list");
  const exitBtn = document.getElementById("exit-fullscreen");
  const prevBtn = document.querySelector(".slider-prev");
  const nextBtn = document.querySelector(".slider-next");
  const dotsContainer = document.querySelector(".slider-dots");

  if (!container || !imagesList || !exitBtn) return;

  const slides = Array.from(imagesList.querySelectorAll("li"));
  if (!slides.length) return;

  let currentIndex = 0;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", `Слайд ${i + 1}`);
    dot.addEventListener("click", () => setActive(i));
    dotsContainer?.appendChild(dot);
    return dot;
  });

  const counter = document.createElement("div");
  counter.className = "slider-counter";
  counter.setAttribute("aria-hidden", "true");
  (imagesList.closest(".main-content") || imagesList.parentElement).appendChild(
    counter,
  );

  const setActive = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((li, i) =>
      li.classList.toggle("active", i === currentIndex),
    );
    dots.forEach((dot, i) =>
      dot.classList.toggle("active", i === currentIndex),
    );
    counter.textContent = `${currentIndex + 1} / ${slides.length}`;
    imagesList.dispatchEvent(new CustomEvent("slidechange"));
  };

  const isFullscreen = () => container.classList.contains("fullscreen");

  const enterFullscreen = (index) => {
    container.classList.add("fullscreen");
    document.body.style.overflow = "hidden";
    setActive(index);
    imagesList.dispatchEvent(new CustomEvent("fsenter"));
  };

  const exitFullscreen = () => {
    container.classList.remove("fullscreen");
    document.body.style.overflow = "";
    imagesList.dispatchEvent(new CustomEvent("slidechange"));
  };

  slides.forEach((li, i) => {
    li.addEventListener("click", () => {
      if (!isFullscreen()) enterFullscreen(i);
    });
  });

  prevBtn?.addEventListener("click", () => setActive(currentIndex - 1));
  nextBtn?.addEventListener("click", () => setActive(currentIndex + 1));
  exitBtn.addEventListener("click", exitFullscreen);

  imagesList.addEventListener("slideprev", () => setActive(currentIndex - 1));
  imagesList.addEventListener("slidenext", () => setActive(currentIndex + 1));

  document.addEventListener("keydown", (e) => {
    if (!isFullscreen()) return;
    if (e.key === "Escape") exitFullscreen();
    if (e.key === "ArrowLeft") setActive(currentIndex - 1);
    if (e.key === "ArrowRight") setActive(currentIndex + 1);
  });
};

const initMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const openSidebar = document.getElementById("open-sidebar");
  const closeSidebar = document.getElementById("close-sidebar");

  const filters = document.getElementById("filters");
  const openFilters = document.getElementById("open-filters");
  const closeFilters = document.getElementById("close-filters");

  if (!openSidebar || !sidebar) return;

  const headerCompareBtn = document.getElementById("header-compare-btn");

  const syncHeaderCompareBtn = () => {
    if (!headerCompareBtn) return;
    const isOverlayOpen =
      sidebar.classList.contains("active") ||
      (filters && filters.classList.contains("active"));
    headerCompareBtn.classList.toggle("hidden", isOverlayOpen);
  };

  const closeSidebarMenu = () => {
    if (!openSidebar || !sidebar) return;

    openSidebar.classList.remove("active");
    sidebar.classList.remove("active");
    document.body.classList.remove("noscroll");
    syncHeaderCompareBtn();
  };

  const closeFiltersMenu = () => {
    if (!openFilters || !filters) return;
    openFilters.classList.remove("active");
    filters.classList.remove("active");
    document.body.classList.remove("noscroll");
    syncHeaderCompareBtn();
  };

  openSidebar.addEventListener("click", () => {
    closeFiltersMenu();
    openSidebar.classList.add("active");
    sidebar.classList.add("active");
    document.body.classList.add("noscroll");
    syncHeaderCompareBtn();
  });

  closeSidebar?.addEventListener("click", closeSidebarMenu);

  if (openFilters && filters) {
    openFilters.addEventListener("click", () => {
      closeSidebarMenu();
      openFilters.classList.add("active");
      filters.classList.add("active");
      document.body.classList.add("noscroll");
      syncHeaderCompareBtn();
    });

    closeFilters?.addEventListener("click", closeFiltersMenu);
  }
};

const serviceToggle = () => {
  document.querySelectorAll(".service-toggle").forEach((btn) => {
    const service = btn.closest(".service");
    const text = btn.querySelector(".service-toggle-text");
    if (!service) return;

    btn.addEventListener("click", () => {
      const collapsed = service.classList.toggle("collapsed");
      btn.setAttribute("aria-expanded", String(!collapsed));
      if (text) text.textContent = collapsed ? "Развернуть" : "Свернуть";
    });
  });
};

const serviceNav = () => {
  const links = Array.from(
    document.querySelectorAll(".sidebar-nav-inner-list a"),
  );
  if (!links.length) return;

  const pairs = [];
  links.forEach((link) => {
    const hash = link.getAttribute("href");
    if (!hash || hash.length < 2 || hash[0] !== "#") return;
    const section = document.getElementById(hash.slice(1));
    if (section) pairs.push({ link, section });
  });
  if (!pairs.length) return;

  const setActive = (link) => {
    links.forEach((l) => l.classList.toggle("active", l === link));
  };

  pairs.forEach(({ link, section }) =>
    link.addEventListener("click", (e) => {
      e.preventDefault();
      setActive(link);
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", link.getAttribute("href"));
    }),
  );

  const visible = new Set();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      });
      const current = pairs.find(({ section }) => visible.has(section));
      if (current) setActive(current.link);
    },
    { rootMargin: "-15% 0px -80% 0px", threshold: 0 },
  );

  pairs.forEach(({ section }) => observer.observe(section));
};

document.addEventListener("DOMContentLoaded", () => {
  serviceToggle();
  serviceNav();
  compare();
  roomTypeFilter();
  scrollUp();
  dualRangeSlider();
  initMenu();
  projectViewTabs();
  fullscreenSlider();
  sliderZoom();
  relatedSlider();
});
