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

  // когда выбран "все" — снимаем остальные
  all.addEventListener("change", () => {
    if (all.checked) {
      types.forEach((input) => {
        input.checked = false;
      });
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

const initMenu = () => {
  const sidebar = document.getElementById("sidebar");
  const openSidebar = document.getElementById("open-sidebar");
  const closeSidebar = document.getElementById("close-sidebar");

  const filters = document.getElementById("filters");
  const openFilters = document.getElementById("open-filters");
  const closeFilters = document.getElementById("close-filters");

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
});
