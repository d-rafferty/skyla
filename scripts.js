const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const currentPage = document.body.dataset.page;
const navLinks = document.querySelectorAll(".site-nav a");
const sillyToggle = document.querySelector("[data-silly-toggle]");
const sillyUfo = document.querySelector(".sticker-ufo");
const sillyUfoImage = document.querySelector(".sticker-ufo-image");
const foxWalker = document.querySelector(".fox-walker");
const foxLane = document.querySelector(".silly-skyline");
const darkHeroHeadingImage = document.querySelector("[data-dark-hero-heading]");
const scrollGalleryTrack = document.querySelector("[data-scroll-gallery]");
const owlDragger = document.querySelector("[data-owl-dragger]");
const keyUnlockButton = document.querySelector("[data-key-unlock]");
const radioTuner = document.querySelector("[data-radio-tuner]");
const frequencyReadout = document.querySelector("[data-frequency-readout]");
const radioStatus = document.querySelector("[data-radio-status]");
const sillyModeKey = "site-silly-mode";
const hasDecoratedDarkMode = currentPage === "home" || currentPage === "flash";
const hasFoxRunnerPage = currentPage === "home" || currentPage === "gallery" || currentPage === "flash";
let ufoCoordinatorReady = false;
const deferredUfoCallbacks = [];
let runUfoThen = (callback) => {
  if (!ufoCoordinatorReady) {
    if (typeof callback === "function") {
      deferredUfoCallbacks.push(callback);
    }
    return;
  }

  callback?.();
};

const getIncomingSillyMode = () => {
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get("mode");

  if (modeParam === "dark") {
    window.localStorage.setItem(sillyModeKey, "true");
    return true;
  }

  if (modeParam === "light") {
    window.localStorage.setItem(sillyModeKey, "false");
    return false;
  }

  return window.localStorage.getItem(sillyModeKey) === "true";
};

const savedSillyMode = getIncomingSillyMode();

const updateInternalLinksWithMode = (enabled) => {
  const currentMode = enabled ? "dark" : "light";
  const pageLinks = document.querySelectorAll('a[href]');

  pageLinks.forEach((link) => {
    const rawHref = link.getAttribute("href");
    if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:") || rawHref.startsWith("tel:")) {
      return;
    }

    try {
      const url = new URL(rawHref, window.location.href);
      if (url.origin !== window.location.origin) {
        return;
      }

      url.searchParams.set("mode", currentMode);
      const nextHref = `${url.pathname}${url.search}${url.hash}`;
      link.setAttribute("href", nextHref);
    } catch {
      // Ignore invalid URLs and leave their hrefs untouched.
    }
  });
};

const updateSillyModeUi = (enabled) => {
  document.body.classList.toggle("silly-mode", enabled);
  updateInternalLinksWithMode(enabled);

  if (sillyToggle) {
    sillyToggle.classList.toggle("is-active", enabled);
    sillyToggle.setAttribute("aria-pressed", String(enabled));
    sillyToggle.setAttribute("aria-label", enabled ? "Turn silly mode off" : "Turn silly mode on");
  }
};

if (!hasDecoratedDarkMode) {
  updateSillyModeUi(savedSillyMode);
}

if (!hasDecoratedDarkMode && sillyToggle) {
  sillyToggle.addEventListener("click", () => {
    const nextState = !document.body.classList.contains("silly-mode");
    updateSillyModeUi(nextState);
    window.localStorage.setItem(sillyModeKey, String(nextState));
  });

  window.addEventListener("storage", (event) => {
    if (event.key !== sillyModeKey) {
      return;
    }

    updateSillyModeUi(event.newValue === "true");
  });
}

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
  const linkHref = link.getAttribute("href");
  const linkPage = linkHref ? new URL(linkHref, window.location.href).pathname.split("/").pop() : "";

  const isHomeLink = currentPage === "home" && linkPage === "index.html";
  const isMatchingSubpage = linkPage && currentPage && linkPage.includes(currentPage);

  if (isHomeLink || isMatchingSubpage) {
    link.classList.add("active");
  }
});

const filterButtons = document.querySelectorAll("[data-filter]");
const galleryItems = document.querySelectorAll("[data-category]");
const galleryArtItems = document.querySelectorAll("[data-gallery-image]");

const loadGalleryArt = (art) => {
  if (!art || art.dataset.loaded === "true") {
    return;
  }

  const source = art.dataset.galleryImage;
  if (!source) {
    return;
  }

  art.dataset.loaded = "true";
  const image = new Image();
  image.decoding = "async";
  image.src = source;

  const paintImage = () => {
    art.style.setProperty("--gallery-image", `url("${source}")`);
  };

  if ("decode" in image) {
    image.decode().catch(() => {}).then(paintImage);
  } else {
    image.addEventListener("load", paintImage, { once: true });
    image.addEventListener("error", paintImage, { once: true });
  }
};

if (galleryArtItems.length) {
  if ("IntersectionObserver" in window) {
    const galleryArtObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadGalleryArt(entry.target);
            galleryArtObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "600px 0px" }
    );

    galleryArtItems.forEach((art) => galleryArtObserver.observe(art));
  } else {
    galleryArtItems.forEach(loadGalleryArt);
  }
}

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

    const name = form.querySelector("#name")?.value.trim() || "";
    const email = form.querySelector("#email")?.value.trim() || "";
    const phone = form.querySelector("#phone")?.value.trim() || "Not provided";
    const placement = form.querySelector("#placement")?.value.trim() || "Not provided";
    const message = form.querySelector("#message")?.value.trim() || "";

    const subject = `Booking Request from ${name || "Website Visitor"}`;
    const body = [
      "New booking request",
      "",
      `Name: ${name || "Not provided"}`,
      `Email: ${email || "Not provided"}`,
      `Phone: ${phone}`,
      `Placement: ${placement}`,
      "",
      "Project Details:",
      message || "Not provided"
    ].join("\n");

    const mailtoUrl = `mailto:definitelynotskylaa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    formStatus.textContent = "Opening your email app with a pre-filled booking request...";
    window.location.href = mailtoUrl;
  });
}

const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (revealItems.length) {
  if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: .2 }
    );

    revealItems.forEach((item) => observer.observe(item));
  }
}

const pausableAnimations = document.querySelectorAll("[data-pause-when-hidden]");

if (pausableAnimations.length) {
  const setPageAnimationState = () => {
    pausableAnimations.forEach((element) => {
      element.classList.toggle("is-page-hidden", document.hidden);
    });
  };

  setPageAnimationState();
  document.addEventListener("visibilitychange", setPageAnimationState);

  if ("IntersectionObserver" in window) {
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
        });
      },
      { rootMargin: "160px 0px" }
    );

    pausableAnimations.forEach((element) => {
      element.classList.add("is-offscreen");
      animationObserver.observe(element);
    });
  }
}

if (hasFoxRunnerPage && foxWalker && foxLane) {
  const foxMinSpeedPxPerSecond = 70;
  const foxMaxSpeedPxPerSecond = 210;
  const foxSpeedRatio = 0.17;
  const foxStartTopPx = 18;
  const foxBottomPaddingPx = 16;
  const foxViewportTopPaddingPx = 10;
  const foxEdgeExitPx = 26;
  const foxOffscreenPaddingPx = 48;
  const foxFrameIntervalMs = 1000 / 30;
  const foxToUfoDelayMs = 1800;
  const siteHeader = document.querySelector(".site-header");

  let foxDirection = 1;
  let foxX = 0;
  let foxY = foxStartTopPx;
  let foxLastTimestamp = 0;
  let foxRafId = 0;
  let foxLaneWidth = 0;
  let foxLaneHeight = 0;
  let foxWidth = 96;
  let foxHeight = 96;
  let foxStartQueued = false;
  let foxHandoffTimeoutId = 0;

  const updateFoxMeasurements = () => {
    const laneRect = foxLane.getBoundingClientRect();
    const foxRect = foxWalker.getBoundingClientRect();

    foxLaneWidth = laneRect.width || foxLaneWidth || 0;
    foxLaneHeight = laneRect.height || foxLaneHeight || 0;
    foxWidth = foxRect.width || foxWidth || 96;
    foxHeight = foxRect.height || foxHeight || 96;
  };

  const getVisibleFoxTopBounds = () => {
    const headerBottom = siteHeader?.getBoundingClientRect().bottom || 0;
    const minTop = Math.max(foxStartTopPx, Math.round(headerBottom + foxViewportTopPaddingPx));
    const maxTop = Math.max(minTop, Math.round((window.innerHeight || 0) - foxHeight - foxBottomPaddingPx));

    return { minTop, maxTop };
  };

  const ensureFoxMeasurements = () => {
    if (foxLaneWidth > 1 && foxLaneHeight > 1 && foxWidth > 1 && foxHeight > 1) {
      return;
    }

    updateFoxMeasurements();

    if (foxLaneWidth <= 1) {
      foxLaneWidth = Math.max(foxLaneWidth, window.innerWidth || 0);
    }

    if (foxLaneHeight <= 1) {
      foxLaneHeight = Math.max(foxLaneHeight, Math.round((window.innerHeight || 720) * 0.45));
    }
  };

  const getRightEdgeExit = () => foxLaneWidth + foxEdgeExitPx + foxOffscreenPaddingPx;
  const getLeftEdgeExit = () => -foxWidth - foxEdgeExitPx - foxOffscreenPaddingPx;

  const getFoxSpeedPxPerSecond = () => {
    ensureFoxMeasurements();
    const laneForSpeed = Math.max(320, foxLaneWidth || window.innerWidth || 0);
    const scaledSpeed = Math.round(laneForSpeed * foxSpeedRatio);

    return Math.max(foxMinSpeedPxPerSecond, Math.min(foxMaxSpeedPxPerSecond, scaledSpeed));
  };

  const getRandomFoxTop = () => {
    const { minTop, maxTop } = getVisibleFoxTopBounds();
    if (maxTop <= minTop) {
      return minTop;
    }

    return Math.round(minTop + Math.random() * (maxTop - minTop));
  };

  const setFoxFacing = () => {
    foxWalker.classList.toggle("is-facing-right", foxDirection === 1);
    foxWalker.classList.toggle("is-facing-left", foxDirection === -1);
  };

  const applyFoxState = () => {
    foxWalker.style.transform = `translate3d(${foxX}px, ${foxY}px, 0)`;
  };

  const stageFoxForNextRun = (useRandomStart = true) => {
    ensureFoxMeasurements();

    if (useRandomStart) {
      foxDirection = Math.random() < 0.5 ? 1 : -1;
    }

    foxY = useRandomStart ? getRandomFoxTop() : getVisibleFoxTopBounds().minTop;
    foxX = foxDirection === 1 ? getLeftEdgeExit() : getRightEdgeExit();
    setFoxFacing();
    applyFoxState();
  };

  const runUfoMovesThen = (remainingMoves, onDone) => {
    if (remainingMoves <= 0) {
      onDone?.();
      return;
    }

    runUfoThen(() => {
      runUfoMovesThen(remainingMoves - 1, onDone);
    });
  };

  const handoffFoxToUfo = () => {
    stageFoxForNextRun(true);
    stopFoxRunner();
    foxStartQueued = true;

    if (foxHandoffTimeoutId) {
      window.clearTimeout(foxHandoffTimeoutId);
      foxHandoffTimeoutId = 0;
    }

    foxHandoffTimeoutId = window.setTimeout(() => {
      foxHandoffTimeoutId = 0;
      runUfoMovesThen(3, () => {
        foxStartQueued = false;
        if (!shouldRunFox()) {
          return;
        }

        stageFoxForNextRun(true);
        startFoxRunner();
      });
    }, foxToUfoDelayMs);
  };

  const resetFoxTrack = () => {
    stageFoxForNextRun(true);
  };

  const shouldRunFox = () => document.body.classList.contains("silly-mode") && !document.hidden;

  const stopFoxRunner = () => {
    if (foxRafId) {
      window.cancelAnimationFrame(foxRafId);
      foxRafId = 0;
    }

    if (foxHandoffTimeoutId) {
      window.clearTimeout(foxHandoffTimeoutId);
      foxHandoffTimeoutId = 0;
    }

    foxStartQueued = false;
    foxLastTimestamp = 0;
  };

  const tickFox = (timestamp) => {
    foxRafId = 0;

    if (!shouldRunFox()) {
      stopFoxRunner();
      return;
    }

    if (!foxLastTimestamp) {
      foxLastTimestamp = timestamp;
    }

    const elapsedMs = timestamp - foxLastTimestamp;
    if (elapsedMs < foxFrameIntervalMs) {
      foxRafId = window.requestAnimationFrame(tickFox);
      return;
    }

    const deltaSeconds = elapsedMs / 1000;
    const foxSpeedPxPerSecond = getFoxSpeedPxPerSecond();
    foxLastTimestamp = timestamp;
    foxX += foxDirection * foxSpeedPxPerSecond * deltaSeconds;

    const rightEdgeExit = getRightEdgeExit();
    const leftEdgeExit = getLeftEdgeExit();

    if (foxDirection === 1 && foxX >= rightEdgeExit) {
      foxX = rightEdgeExit;
      foxDirection = -1;
      handoffFoxToUfo();
      return;
    } else if (foxDirection === -1 && foxX <= leftEdgeExit) {
      foxX = leftEdgeExit;
      foxDirection = 1;
      handoffFoxToUfo();
      return;
    }

    applyFoxState();
    foxRafId = window.requestAnimationFrame(tickFox);
  };

  const startFoxRunner = () => {
    if (foxRafId || foxStartQueued || !shouldRunFox()) {
      return;
    }

    updateFoxMeasurements();
    stageFoxForNextRun(true);
    foxLastTimestamp = 0;
    foxRafId = window.requestAnimationFrame(tickFox);
  };

  const requestFoxStart = () => {
    if (foxRafId || foxStartQueued || !shouldRunFox()) {
      return;
    }

    if (!hasDecoratedDarkMode) {
      startFoxRunner();
      return;
    }

    foxStartQueued = true;
    runUfoMovesThen(3, () => {
      foxStartQueued = false;
      if (!shouldRunFox()) {
        return;
      }

      startFoxRunner();
    });
  };

  resetFoxTrack();
  requestFoxStart();

  window.addEventListener("resize", () => {
    updateFoxMeasurements();
    const rightEdgeExit = getRightEdgeExit();
    const leftEdgeExit = getLeftEdgeExit();
    const { minTop, maxTop } = getVisibleFoxTopBounds();
    foxX = Math.min(rightEdgeExit, Math.max(leftEdgeExit, foxX));
    foxY = Math.max(minTop, Math.min(maxTop, foxY));
    applyFoxState();
  });

  if ("ResizeObserver" in window) {
    const foxResizeObserver = new ResizeObserver(() => {
      updateFoxMeasurements();
    });

    foxResizeObserver.observe(foxLane);
    foxResizeObserver.observe(foxWalker);
  }

  document.addEventListener("visibilitychange", () => {
    if (shouldRunFox()) {
      requestFoxStart();
      return;
    }

    stopFoxRunner();
  });

  const sillyModeObserver = new MutationObserver(() => {
    if (shouldRunFox()) {
      requestFoxStart();
      return;
    }

    stopFoxRunner();
  });

  sillyModeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
}

if (hasDecoratedDarkMode) {
  const unlockSequence = "cvhwpmbgvm";
  const ufoMaxRotate = 18;
  const ufoMinScale = 0.95;
  const ufoScaleRange = 0.35;
  const ufoMoveDurationMs = 2500;
  const ufoGapBetweenMovesMs = 1800;
  let sillyUfoTimeoutId;
  let typedBuffer = "";
  let unlockTriggered = false;
  let isUfoMoving = false;
  const pendingUfoCallbacks = [];

  const shouldRunUfo = () => document.body.classList.contains("silly-mode") && !document.hidden;

  const setRandomUfoTransform = () => {
    if (!sillyUfo) {
      return;
    }

    const top = Math.round(4 + Math.random() * 78);
    const left = Math.round(2 + Math.random() * 92);
    const rotate = Math.round(-ufoMaxRotate + Math.random() * (ufoMaxRotate * 2));
    const scale = (ufoMinScale + Math.random() * ufoScaleRange).toFixed(2);

    sillyUfo.style.transform = `translate3d(${left}vw, ${top}vh, 0) rotate(${rotate}deg) scale(${scale})`;
  };

  const moveUfo = () => {
    if (!sillyUfo || !shouldRunUfo()) {
      const callback = pendingUfoCallbacks.shift();
      callback?.();

      return;
    }

    setRandomUfoTransform();

    sillyUfoTimeoutId = window.setTimeout(() => {
      isUfoMoving = false;
      sillyUfoTimeoutId = window.setTimeout(() => {
        const callback = pendingUfoCallbacks.shift();
        callback?.();
      }, ufoGapBetweenMovesMs);
    }, ufoMoveDurationMs);
  };

  const startUfoWander = () => {
    if (!sillyUfo || !shouldRunUfo()) {
      return;
    }

    const ufoSource = sillyUfoImage?.dataset.src;
    if (ufoSource && !sillyUfoImage.getAttribute("src")) {
      sillyUfoImage.src = ufoSource;
    }

    window.clearTimeout(sillyUfoTimeoutId);
    isUfoMoving = false;
  };

  const stopUfoWander = () => {
    if (!sillyUfo) {
      return;
    }

    window.clearTimeout(sillyUfoTimeoutId);
    isUfoMoving = false;
    sillyUfo.style.left = "";
    sillyUfo.style.right = "";
    sillyUfo.style.top = "";
    sillyUfo.style.transform = "";
    sillyUfoImage?.removeAttribute("src");
  };

  runUfoThen = (callback) => {
    if (!sillyUfo || !shouldRunUfo()) {
      callback?.();
      return;
    }

    pendingUfoCallbacks.push(callback);

    if (isUfoMoving) {
      return;
    }

    const ufoSource = sillyUfoImage?.dataset.src;
    if (ufoSource && !sillyUfoImage.getAttribute("src")) {
      sillyUfoImage.src = ufoSource;
    }

    isUfoMoving = true;
    moveUfo();
  };

  ufoCoordinatorReady = true;
  if (deferredUfoCallbacks.length) {
    const queuedCallbacks = deferredUfoCallbacks.splice(0, deferredUfoCallbacks.length);
    queuedCallbacks.forEach((callback) => runUfoThen(callback));
  }

  const setSillyMode = (enabled) => {
    updateSillyModeUi(enabled);
    window.localStorage.setItem(sillyModeKey, String(enabled));
    const darkHeadingSource = darkHeroHeadingImage?.dataset.src;
    if (darkHeadingSource && enabled) {
      darkHeroHeadingImage.src = darkHeadingSource;
    } else if (darkHeroHeadingImage) {
      darkHeroHeadingImage.removeAttribute("src");
    }

    if (keyUnlockButton) {
      keyUnlockButton.classList.toggle("is-visible", enabled && unlockTriggered);
    }

    if (enabled) {
      startUfoWander();
    } else {
      stopUfoWander();
    }
  };

  setSillyMode(savedSillyMode);

  if (sillyToggle) {
    sillyToggle.addEventListener("click", () => {
      const nextState = !document.body.classList.contains("silly-mode");
      setSillyMode(nextState);
    });
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== sillyModeKey) {
      return;
    }

    setSillyMode(event.newValue === "true");
  });

  document.addEventListener("visibilitychange", () => {
    if (shouldRunUfo()) {
      startUfoWander();
      return;
    }

    stopUfoWander();
  });

  if (currentPage === "home") {
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
}

if (currentPage === "gallery") {
  const nukeButton = document.querySelector("[data-nuke-button]");
  const nukeTerminal = document.querySelector("[data-nuke-terminal]");
  const nukeTerminalScreen = document.querySelector("[data-nuke-terminal-screen]");
  const nukeCloseButton = document.querySelector("[data-nuke-close]");
  const nukeForm = document.querySelector("[data-nuke-form]");
  const nukeInput = document.querySelector("[data-nuke-input]");
  const nukeStatus = document.querySelector("[data-nuke-status]");
  const galleryGrid = document.querySelector("[data-gallery-grid]");
  const nukeCode = "ILOVENUKES";
  const nukeTerminalMessage = `> establishing launch relay...\n> confirmation code: ${nukeCode}\n> type the code exactly to proceed.`;
  const finaleMessage = "the world must start anew. they will not forget this.";
  const nukeAudio = new Audio("sounds/nuke.mp3");
  const deathAudio = new Audio("sounds/death.mp3");
  let nukeBusy = false;
  let nukeTypingTimeoutId = 0;
  let finaleActive = false;

  nukeAudio.preload = "auto";
  deathAudio.preload = "auto";

  const getLaunchableCards = () =>
    Array.from(document.querySelectorAll(".gallery-card"))
      .filter((card) => !card.hidden && !card.classList.contains("is-destroyed") && !card.classList.contains("is-destroying"));

  const getTopRowCards = () => {
    const launchableCards = getLaunchableCards();
    if (launchableCards.length === 0) {
      return [];
    }

    const firstRowTop = launchableCards[0].getBoundingClientRect().top;
    return launchableCards.filter((card) => {
      const { top } = card.getBoundingClientRect();
      return Math.abs(top - firstRowTop) < 24;
    });
  };

  const setNukeStatus = (message) => {
    if (nukeStatus) {
      nukeStatus.textContent = message;
    }
  };

  const typeNukeMessage = (message, onComplete) => {
    if (!nukeTerminalScreen) {
      onComplete?.();
      return;
    }

    window.clearTimeout(nukeTypingTimeoutId);
    nukeTerminalScreen.textContent = "";

    let index = 0;
    const step = () => {
      nukeTerminalScreen.textContent = message.slice(0, index);
      index += 1;

      if (index <= message.length) {
        nukeTypingTimeoutId = window.setTimeout(step, 24);
      } else {
        onComplete?.();
      }
    };

    step();
  };

  const openNukeTerminal = () => {
    if (!nukeTerminal) {
      return;
    }

    nukeTerminal.hidden = false;
    if (nukeCloseButton) {
      nukeCloseButton.hidden = false;
    }
    if (nukeForm) {
      nukeForm.hidden = true;
    }

    typeNukeMessage(nukeTerminalMessage, () => {
      if (nukeForm) {
        nukeForm.hidden = false;
      }

      if (nukeInput) {
        nukeInput.focus();
      }
    });
  };

  const runGalleryFinale = () => {
    if (!nukeTerminal || finaleActive) {
      return;
    }

    finaleActive = true;
    nukeTerminal.hidden = false;

    if (nukeForm) {
      nukeForm.hidden = true;
    }

    if (nukeCloseButton) {
      nukeCloseButton.hidden = true;
    }

    if (nukeStatus) {
      nukeStatus.textContent = "";
    }

    typeNukeMessage(finaleMessage, () => {
      if (nukeStatus) {
        nukeStatus.textContent = "";
      }
      deathAudio.currentTime = 0;
      void deathAudio.play().catch(() => {});
      window.setTimeout(() => {
        window.localStorage.setItem(sillyModeKey, "false");
        window.location.href = "index.html";
      }, 5000);
    });
  };

  const closeNukeTerminal = () => {
    if (!nukeTerminal || finaleActive) {
      return;
    }

    window.clearTimeout(nukeTypingTimeoutId);
    nukeTerminal.hidden = true;
    if (nukeForm) {
      nukeForm.hidden = true;
    }
    if (nukeInput) {
      nukeInput.value = "";
    }
  };

  const spawnExplosion = (x, y) => {
    const burst = document.createElement("div");
    burst.className = "explosion-burst";
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;
    document.body.append(burst);
    window.setTimeout(() => burst.remove(), 3000);
  };

  const launchMissileAt = (targetCard) => {
    if (!nukeButton || !galleryGrid) {
      nukeBusy = false;
      return;
    }

    const targetRect = targetCard.getBoundingClientRect();
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;
    const startX = Math.min(window.innerWidth - 120, targetX + 220);
    const startY = Math.max(72, Math.min(140, targetY - 120));
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    const missile = document.createElement("div");
    missile.className = "missile-trail";
    missile.style.left = `${startX}px`;
    missile.style.top = `${startY}px`;
    missile.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    missile.innerHTML = "<span></span>";
    document.body.append(missile);

    void missile.getBoundingClientRect();

    window.setTimeout(() => {
      missile.style.left = `${targetX}px`;
      missile.style.top = `${targetY}px`;
      missile.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    }, 40);

    window.setTimeout(() => {
      missile.remove();
      spawnExplosion(targetX, targetY);
      targetCard.classList.add("is-destroying");
      window.setTimeout(() => {
        targetCard.classList.remove("is-destroying");
        targetCard.classList.add("is-destroyed");
        targetCard.remove();
        nukeBusy = false;

        if (nukeForm) {
          nukeForm.hidden = true;
        }

        if (nukeInput) {
          nukeInput.value = "";
        }

        closeNukeTerminal();

        const remainingCards = getLaunchableCards();
        if (remainingCards.length === 0) {
          runGalleryFinale();
        } else {
          setNukeStatus("Impact confirmed. One gallery image has been removed.");
        }
      }, 700);
    }, 4200);
  };

  if (nukeButton) {
    nukeButton.addEventListener("click", () => {
      if (nukeBusy) {
        return;
      }

      if (getLaunchableCards().length === 0) {
        setNukeStatus("No images remain to target.");
        return;
      }

      setNukeStatus("Launch console opened. Awaiting code confirmation.");
      openNukeTerminal();
    });
  }

  if (nukeForm && nukeInput) {
    nukeForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (nukeBusy) {
        return;
      }

      const enteredCode = nukeInput.value.trim().toUpperCase();
      if (enteredCode !== nukeCode) {
        setNukeStatus("Incorrect code. Launch aborted.");
        return;
      }

      const topRowCards = getTopRowCards();
      const targetPool = topRowCards.length ? topRowCards : getLaunchableCards();
      const targetCard = targetPool[Math.floor(Math.random() * targetPool.length)];

      if (!targetCard) {
        setNukeStatus("No images remain to target.");
        return;
      }

      nukeBusy = true;
      setNukeStatus("Code accepted. Launching in 1 second.");
      nukeAudio.currentTime = 0;
      void nukeAudio.play().catch(() => {});
      window.setTimeout(() => {
        closeNukeTerminal();
        setNukeStatus("Missile inbound.");
        launchMissileAt(targetCard);
      }, 1000);
    });
  }

  if (nukeCloseButton) {
    nukeCloseButton.addEventListener("click", () => {
      closeNukeTerminal();
      setNukeStatus("Launch console closed.");
    });
  }
}

if (currentPage === "home" && scrollGalleryTrack) {
  const homeGalleryImages = [
    { src: "images/home-gallery-1.webp", alt: "Handpoke tattoo gallery image 1" },
    { src: "images/home-gallery-2.webp", alt: "Handpoke tattoo gallery image 2" },
    { src: "images/home-gallery-3.webp", alt: "Handpoke tattoo gallery image 3" },
    { src: "images/home-gallery-4.webp", alt: "Handpoke tattoo gallery image 4" },
    { src: "images/home-gallery-5.webp", alt: "Handpoke tattoo gallery image 5" }
  ];

  const buildGalleryCard = ({ src, alt }) => {
    const card = document.createElement("article");
    card.className = "scroll-gallery-card";

    const image = document.createElement("img");
    image.className = "scroll-gallery-image";
    image.src = src;
    image.alt = alt;
    image.loading = "lazy";
    image.decoding = "async";

    card.append(image);
    return card;
  };

  const galleryCards = homeGalleryImages.map(buildGalleryCard);
  scrollGalleryTrack.replaceChildren(...galleryCards);
  scrollGalleryTrack.classList.remove("is-animating");
  scrollGalleryTrack.style.transform = "none";
}

if (hasDecoratedDarkMode && owlDragger) {
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
    { value: 1044, file: "sounds/chatter3.mp3", label: "A stranger voice keeps slipping in and out." }
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
