const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const currentPage = document.body.dataset.page;
const navLinks = document.querySelectorAll(".site-nav a");

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
