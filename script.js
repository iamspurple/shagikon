const compare = () => {
  const compareBtn = document.getElementById("compare-btn");
  const compareInputs = document.querySelectorAll('input[name="compare"]');
  const projectList = document.getElementById("projects-list");

  if (!compareBtn || !compareInputs || !projectList) return;

  let compareMode = false;

  compareBtn.addEventListener("click", () => {
    if (compareMode) {
      compareInputs.forEach((input) => {
        input.checked = false;
      });
      compareMode = false;
      compareBtn.innerText = "сравнить";

      projectList.classList.remove("compare-mode");
    } else {
      projectList.classList.add("compare-mode");
      compareMode = true;
      compareBtn.innerText = "показать все";
    }
  });

  let checkedQuantity = 0;

  compareInputs.forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked == true) {
        checkedQuantity += 1;
      } else {
        checkedQuantity -= 1;
      }
      compareBtn.innerText = `сравнить ${checkedQuantity}`;
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

  openSidebar.addEventListener("click", () => {
    openSidebar.classList.add("active");
    sidebar.classList.add("active");
    document.body.classList.add("noscroll");
  });

  closeSidebar.addEventListener("click", () => {
    openSidebar.classList.remove("active");
    sidebar.classList.remove("active");
    document.body.classList.remove("noscroll");
  });

  openFilters.addEventListener("click", () => {
    openFilters.classList.add("active");
    filters.classList.add("active");
    document.body.classList.add("noscroll");
  });

  closeFilters.addEventListener("click", () => {
    openFilters.classList.remove("active");
    filters.classList.remove("active");
    document.body.classList.remove("noscroll");
  });
};

document.addEventListener("DOMContentLoaded", () => {
  compare();
  scrollUp();
  dualRangeSlider();
  initMenu();
});
