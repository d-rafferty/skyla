const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const currentPage = document.body.dataset.page;
const navLinks = document.querySelectorAll(".site-nav a");
const sillyToggle = document.querySelector("[data-silly-toggle]");
const sillyUfo = document.querySelector(".sticker-ufo");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

navLinks.forEach((link) => {
  const linkPage = link.getAttribute("href")?.split("#")[0];

  const isHomeLink = currentPage === "home" && linkPage === "index.html";
  const isMatchingSubpage = linkPage && currentPage && linkPage.includes(currentPage);

  if (isHomeLink || isMatchingSubpage) {
    link.classList.add("active");
  }
});

const filterButtons = document.querySelectorAll("[data-filter]");
const galleryItems = document.querySelectorAll("[data-category]");

if (filterButtons.length && galleryItems.length) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      galleryItems.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        card.hidden = !matches;
      });
    });
  });
}

const form = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector(".form-status");

if (form && formStatus) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstName = form.querySelector("#name")?.value.trim() || "there";
    formStatus.textContent = `Thanks, ${firstName}. Your request is ready to send to the shop team.`;
    form.reset();
  });
}

const revealItems = document.querySelectorAll(".reveal");

if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

if (currentPage === "home" && sillyToggle) {
  const sillyModeKey = "home-silly-mode";
  const savedMode = window.localStorage.getItem(sillyModeKey) === "true";
  let sillyUfoTimeoutId;

  const moveUfo = () => {
    if (!sillyUfo || !document.body.classList.contains("silly-mode")) {
      return;
    }

    const top = Math.round(6 + Math.random() * 52);
    const left = Math.round(8 + Math.random() * 78);
    const rotate = Math.round(-18 + Math.random() * 36);
    const scale = (0.95 + Math.random() * 0.35).toFixed(2);

    sillyUfo.style.left = `${left}%`;
    sillyUfo.style.right = "auto";
    sillyUfo.style.top = `${top}vh`;
    sillyUfo.style.transform = `translate3d(0, 0, 0) rotate(${rotate}deg) scale(${scale})`;

    const nextDelay = 2500 + Math.round(Math.random() * 5000);
    sillyUfoTimeoutId = window.setTimeout(moveUfo, nextDelay);
  };

  const startUfoWander = () => {
    if (!sillyUfo) {
      return;
    }

    window.clearTimeout(sillyUfoTimeoutId);
    moveUfo();
  };

  const stopUfoWander = () => {
    if (!sillyUfo) {
      return;
    }

    window.clearTimeout(sillyUfoTimeoutId);
    sillyUfo.style.left = "";
    sillyUfo.style.right = "";
    sillyUfo.style.top = "";
    sillyUfo.style.transform = "";
  };

  const setSillyMode = (enabled) => {
    document.body.classList.toggle("silly-mode", enabled);
    sillyToggle.classList.toggle("is-active", enabled);
    sillyToggle.setAttribute("aria-pressed", String(enabled));
    sillyToggle.setAttribute("aria-label", enabled ? "Turn silly mode off" : "Turn silly mode on");
    window.localStorage.setItem(sillyModeKey, String(enabled));

    if (enabled) {
      startUfoWander();
    } else {
      stopUfoWander();
    }
  };

  setSillyMode(savedMode);

  sillyToggle.addEventListener("click", () => {
    const nextState = !document.body.classList.contains("silly-mode");
    setSillyMode(nextState);
  });
}
