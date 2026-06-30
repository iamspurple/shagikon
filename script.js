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
  const types = document.querySelectorAll(
    'input[name="roomtype"]:not(#all)'
  );

  if (!all || !types.length) return;

  // когда выбран "все" — снимаем остальные; снять сам "все" кликом нельзя
  // (он сбрасывается только при выборе конкретного типа)
  all.addEventListener("change", () => {
    if (all.checked) {
      types.forEach((input) => {
        input.checked = false;
      });
    } else {
      all.checked = true;
    }
  });

  // как только чекнут один из остальных — "все" теряет состояние checked
  types.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        all.checked = false;
      }

      // если не выбран ни один тип — возвращаемся к "все"
      const anyChecked = Array.from(types).some((i) => i.checked);
      if (!anyChecked) {
        all.checked = true;
      }
    });
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

      const toPercent = (val, input) =>
        5 +
        ((val - parseInt(input.min)) / (parseInt(input.max) - parseInt(input.min))) *
          80;

      minVal.style.left = `${toPercent(low, minInput)}%`;
      maxVal.style.left = `${toPercent(high, maxInput)}%`;

      // диапазон активен, если хотя бы один ползунок сдвинут от своего края
      const isActive =
        low > parseInt(minInput.min) || high < parseInt(maxInput.max);
      range.classList.toggle("active", isActive);

      // когда min thumb у правого края — поднимаем его z-index, чтобы можно было потянуть влево
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

  // начальное состояние — по активной кнопке (по умолчанию чертежи)
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

  // шаг = ширина слайда + gap (читаем из DOM, поэтому корректно на всех брейкпоинтах)
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

  window.addEventListener("resize", update);
  update();
};

const sliderZoom = () => {
  const container = document.querySelector(".container");
  const imagesList = document.querySelector(".images-list");
  if (!container || !imagesList) return;

  const MAX_SCALE = 4;
  const DOUBLE_TAP_SCALE = 2.5; // во сколько увеличивает двойной тап
  const TAP_MOVE = 10; // px — в пределах этого жест считается тапом, не свайпом
  const TAP_TIME = 300; // мс — максимальная длительность тапа
  const DOUBLE_TAP_GAP = 300; // мс между двумя тапами
  const SWIPE_THRESHOLD = 40; // px — порог свайпа-листания

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
  // состояние жеста для распознавания тапа/свайпа
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

  // слайд больше не поворачивается, оси пальца совпадают с осями слайда
  const toLocal = (dx, dy) => ({ x: dx, y: dy });

  const points = () => [...pointers.values()];
  const dist = (a, b) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

  // не даём утащить увеличенную картинку за пределы (в серую пустоту)
  const clampPan = () => {
    const img = activeImg();
    if (!img) return;
    const maxX = Math.max(0, (img.offsetWidth * scale - viewer.clientWidth) / 2);
    const maxY = Math.max(
      0,
      (img.offsetHeight * scale - viewer.clientHeight) / 2
    );
    tx = clamp(tx, -maxX, maxX);
    ty = clamp(ty, -maxY, maxY);
  };

  const apply = () => {
    const img = activeImg();
    if (img) img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    // при увеличении прячем элементы управления (счётчик/точки/стрелки)
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

  // показ/скрытие стрелок (поведение тача — см. CSS).
  // autoHide=true — спрятать сами через 1с (используем при входе в fullscreen)
  const setControls = (visible, autoHide) => {
    clearTimeout(controlsTimer);
    container.classList.toggle("controls-visible", visible);
    if (visible && autoHide) {
      controlsTimer = setTimeout(
        () => container.classList.remove("controls-visible"),
        1000
      );
    }
  };

  // тап при scale 1 — переключает видимость стрелок (без авто-скрытия)
  const toggleControls = () =>
    setControls(!container.classList.contains("controls-visible"), false);

  // двойной тап: увеличение в точку касания или возврат к 1
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
      // сдвиг, чтобы точка касания осталась под пальцем
      tx = (x - cx) * (1 - scale);
      ty = (y - cy) * (1 - scale);
      clampPan();
      // гасим стрелки, чтобы они не всплыли при последующем выходе из зума
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
      // второй тап вовремя — это даблтап: отменяем отложенный одиночный
      clearTimeout(tapTimer);
      tapTimer = null;
      lastTapTime = 0; // чтобы тройной тап не считался ещё одним двойным
      toggleZoom(x, y);
    } else {
      lastTapTime = now;
      lastTapX = x;
      lastTapY = y;
      // одиночный тап откладываем на окно даблтапа — чтобы первый тап
      // даблтапа не мигал стрелками; если второго тапа нет — переключаем
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
      // начало нового жеста
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
      // щипок — масштаб
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
      // панорамирование одним пальцем, когда увеличено
      const local = toLocal(e.clientX - startPanX, e.clientY - startPanY);
      tx = startTx + local.x;
      ty = startTy + local.y;
      clampPan();
      apply();
      e.preventDefault();
    }
    // scale === 1 и один палец — картинку не двигаем: это свайп/тап (решаем на up)
  };

  const onUp = (e) => {
    // обрабатываем только тач-жесты, начатые в fullscreen
    if (e.pointerType !== "touch" || !inFullscreen()) {
      pointers.delete(e.pointerId);
      return;
    }
    const endX = e.clientX;
    const endY = e.clientY;
    pointers.delete(e.pointerId);

    // ещё остались пальцы — жест не завершён
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
      // был щипок — масштаб уже применён, ни тап, ни свайп не засчитываем
    } else if (moved < TAP_MOVE && dt < TAP_TIME) {
      handleTap(endX, endY);
    } else if (
      scale === 1 &&
      Math.abs(dx) > SWIPE_THRESHOLD &&
      Math.abs(dx) > Math.abs(dy)
    ) {
      // свайп листает, только когда не увеличено
      imagesList.dispatchEvent(
        new CustomEvent(dx < 0 ? "slidenext" : "slideprev")
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
    imagesList.addEventListener(type, onUp)
  );

  // сброс масштаба при смене слайда / выходе из fullscreen
  imagesList.addEventListener("slidechange", reset);

  // при входе в fullscreen стрелки показываются и прячутся через 1с
  imagesList.addEventListener("fsenter", () => setControls(true, true));

  // блокируем нативный зум страницы на iOS Safari (жесты pinch)
  ["gesturestart", "gesturechange", "gestureend"].forEach((type) =>
    document.addEventListener(type, (e) => e.preventDefault())
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

  // точки по числу слайдов
  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "slider-dot";
    dot.setAttribute("aria-label", `Слайд ${i + 1}`);
    dot.addEventListener("click", () => setActive(i));
    dotsContainer?.appendChild(dot);
    return dot;
  });

  // числовой указатель «текущий / всего» — привязан к вьюеру, рядом с точками
  const counter = document.createElement("div");
  counter.className = "slider-counter";
  counter.setAttribute("aria-hidden", "true");
  (imagesList.closest(".main-content") || imagesList.parentElement).appendChild(
    counter
  );

  const setActive = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    slides.forEach((li, i) =>
      li.classList.toggle("active", i === currentIndex)
    );
    dots.forEach((dot, i) => dot.classList.toggle("active", i === currentIndex));
    counter.textContent = `${currentIndex + 1} / ${slides.length}`;
    // сообщаем зуму, что слайд сменился — нужно сбросить масштаб
    imagesList.dispatchEvent(new CustomEvent("slidechange"));
  };

  const isFullscreen = () => container.classList.contains("fullscreen");

  const enterFullscreen = (index) => {
    container.classList.add("fullscreen");
    document.body.style.overflow = "hidden";
    setActive(index);
    // показать стрелки при входе (sliderZoom спрячет их через 1с)
    imagesList.dispatchEvent(new CustomEvent("fsenter"));
  };

  const exitFullscreen = () => {
    container.classList.remove("fullscreen");
    document.body.style.overflow = "";
    imagesList.dispatchEvent(new CustomEvent("slidechange"));
  };

  slides.forEach((li, i) => {
    li.addEventListener("click", () => {
      // открываем fullscreen только из обычного режима
      if (!isFullscreen()) enterFullscreen(i);
    });
  });

  prevBtn?.addEventListener("click", () => setActive(currentIndex - 1));
  nextBtn?.addEventListener("click", () => setActive(currentIndex + 1));
  exitBtn.addEventListener("click", exitFullscreen);

  // листание свайпом (события шлёт sliderZoom, когда scale === 1)
  imagesList.addEventListener("slideprev", () => setActive(currentIndex - 1));
  imagesList.addEventListener("slidenext", () => setActive(currentIndex + 1));

  // управление с клавиатуры в fullscreen
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

  // меню есть только на странице со списком проектов
  if (!openSidebar || !openFilters) return;

  const headerCompareBtn = document.getElementById("header-compare-btn");

  // скрываем кнопку сравнения в шапке, пока открыто меню или фильтры
  const syncHeaderCompareBtn = () => {
    if (!headerCompareBtn) return;
    const isOverlayOpen =
      sidebar.classList.contains("active") ||
      filters.classList.contains("active");
    headerCompareBtn.classList.toggle("hidden", isOverlayOpen);
  };

  const closeSidebarMenu = () => {
    openSidebar.classList.remove("active");
    sidebar.classList.remove("active");
    document.body.classList.remove("noscroll");
    syncHeaderCompareBtn();
  };

  const closeFiltersMenu = () => {
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

  closeSidebar.addEventListener("click", closeSidebarMenu);

  openFilters.addEventListener("click", () => {
    closeSidebarMenu();
    openFilters.classList.add("active");
    filters.classList.add("active");
    document.body.classList.add("noscroll");
    syncHeaderCompareBtn();
  });

  closeFilters.addEventListener("click", closeFiltersMenu);
};

document.addEventListener("DOMContentLoaded", () => {
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
