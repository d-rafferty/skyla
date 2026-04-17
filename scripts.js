const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const currentPage = document.body.dataset.page;
const navLinks = document.querySelectorAll(".site-nav a");
const sillyToggle = document.querySelector("[data-silly-toggle]");
const sillyUfo = document.querySelector(".sticker-ufo");
const scrollGalleryTrack = document.querySelector("[data-scroll-gallery]");
const owlDragger = document.querySelector("[data-owl-dragger]");
const keyUnlockButton = document.querySelector("[data-key-unlock]");
const radioTuner = document.querySelector("[data-radio-tuner]");
const frequencyReadout = document.querySelector("[data-frequency-readout]");
const radioStatus = document.querySelector("[data-radio-status]");

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
  const unlockSequence = "cvhwpmbgvm";
  const savedMode = window.localStorage.getItem(sillyModeKey) === "true";
  let sillyUfoTimeoutId;
  let typedBuffer = "";
  let unlockTriggered = false;

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
    if (keyUnlockButton) {
      keyUnlockButton.classList.toggle("is-visible", enabled && unlockTriggered);
    }

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

  window.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) {
      return;
    }

    typedBuffer = `${typedBuffer}${event.key.toLowerCase()}`.slice(-unlockSequence.length);

    if (typedBuffer === unlockSequence && document.body.classList.contains("silly-mode")) {
      unlockTriggered = true;
      if (keyUnlockButton) {
        keyUnlockButton.classList.add("is-visible");
      }
    }
  });
}

if (currentPage === "home" && scrollGalleryTrack) {
  let offset = 0;
  let lastTimestamp = 0;
  let galleryRafId = 0;
  const galleryFadeBuffer = () => (window.innerWidth >= 700 ? 64 : 44);
  const gallerySpacer = scrollGalleryTrack.querySelector(".scroll-gallery-spacer");

  const getGallerySpeed = () =>
    document.body.classList.contains("silly-mode") ? 32 : 20;

  const tickGallery = (timestamp) => {
    if (!lastTimestamp) {
      lastTimestamp = timestamp;
    }

    const deltaSeconds = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    offset += getGallerySpeed() * deltaSeconds;

    const firstCard = scrollGalleryTrack.querySelector(".scroll-gallery-card");

    if (firstCard instanceof HTMLElement) {
      const cardStyles = window.getComputedStyle(scrollGalleryTrack);
      const gap = Number.parseFloat(cardStyles.columnGap || cardStyles.gap || "0");
      const firstCardWidth = firstCard.getBoundingClientRect().width + gap;

      if (offset >= firstCardWidth + galleryFadeBuffer()) {
        offset -= firstCardWidth;
        if (gallerySpacer) {
          scrollGalleryTrack.insertBefore(firstCard, gallerySpacer);
        } else {
          scrollGalleryTrack.append(firstCard);
        }
      }
    }

    scrollGalleryTrack.style.transform = `translateX(${-offset}px)`;
    galleryRafId = window.requestAnimationFrame(tickGallery);
  };

  galleryRafId = window.requestAnimationFrame(tickGallery);

  window.addEventListener("resize", () => {
    scrollGalleryTrack.style.transform = `translateX(${-offset}px)`;
  });
}

if (currentPage === "home" && owlDragger) {
  let owlPointerId = null;
  let owlOriginX = 0;
  let owlOriginY = 0;
  let owlDeltaX = 0;
  let owlDeltaY = 0;

  const paintOwlPosition = () => {
    owlDragger.style.transform = `translate(${owlDeltaX}px, ${owlDeltaY}px)`;
  };

  owlDragger.addEventListener("pointerdown", (event) => {
    owlPointerId = event.pointerId;
    owlOriginX = event.clientX - owlDeltaX;
    owlOriginY = event.clientY - owlDeltaY;
    owlDragger.classList.add("is-dragging");
    owlDragger.setPointerCapture(event.pointerId);
  });

  owlDragger.addEventListener("pointermove", (event) => {
    if (owlPointerId !== event.pointerId) {
      return;
    }

    owlDeltaX = event.clientX - owlOriginX;
    owlDeltaY = event.clientY - owlOriginY;
    paintOwlPosition();
  });

  const releaseOwl = (event) => {
    if (owlPointerId !== event.pointerId) {
      return;
    }

    owlPointerId = null;
    owlDragger.classList.remove("is-dragging");
    owlDragger.releasePointerCapture(event.pointerId);
  };

  owlDragger.addEventListener("pointerup", releaseOwl);
  owlDragger.addEventListener("pointercancel", releaseOwl);
}

if (currentPage === "secret" && radioTuner && frequencyReadout) {
  const stations = [
    { value: 931, file: "sounds/chatter1.mp3", label: "Faint voices in the noise." },
    { value: 986, file: "sounds/chatter2.mp3", label: "Cross-talk and distant chatter." },
    { value: 1017, file: "sounds/morse.wav", label: "A coded signal breaks through." },
    { value: 1024, file: "sounds/chatter3.mp3", label: "A stranger voice keeps slipping in and out." }
  ];

  const audioCache = new Map();
  let activeAudio = null;

  const getAudio = (file) => {
    if (!audioCache.has(file)) {
      const audio = new Audio(file);
      audio.loop = true;
      audio.preload = "auto";
      audioCache.set(file, audio);
    }

    return audioCache.get(file);
  };

  const stopAudio = () => {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
    }
  };

  const tuneRadio = async () => {
    const tunerValue = Number(radioTuner.value);
    const frequency = tunerValue / 10;
    const station = stations.find((item) => tunerValue === item.value)
      || { file: "sounds/static.mp3", label: "Static only." };

    frequencyReadout.textContent = frequency.toFixed(1);
    if (radioStatus) {
      radioStatus.textContent = station.label;
    }

    const nextAudio = getAudio(station.file);

    if (activeAudio !== nextAudio) {
      stopAudio();
      activeAudio = nextAudio;
    }

    try {
      await activeAudio.play();
    } catch {
      if (radioStatus) {
        radioStatus.textContent = `${station.label} Move the tuner again to start audio.`;
      }
    }
  };

  radioTuner.addEventListener("input", tuneRadio);
  tuneRadio();
}
