const MIN_LOADING_TIME = 500;
const start = Date.now();

window.addEventListener("load", () => {
  const elapsed = Date.now() - start;
  const delay = Math.max(0, MIN_LOADING_TIME - elapsed);

  setTimeout(() => {
    const preloader = document.getElementById("preloader");
    const content = document.getElementById("contente");

    if (preloader) preloader.style.display = "none";
    if (content) content.style.display = "block";

    requestAnimationFrame(() => {
      initializeApp();
    });
  }, delay);
});

// ----------------------------------------
//   SLIDESHOW – GLOBÁLNE PREMENNÉ
// ----------------------------------------
const slides = document.querySelectorAll(".content-slide");
let currentSlide = 0;

slides.forEach((s, i) => {
  if (i !== 0) {
    s.classList.add("hidden-slide");
    gsap.set(s, { opacity: 0 });
  } else {
    gsap.set(s, { opacity: 1 });
  }
});

document.addEventListener("click", (e) => {
  if (e.target.closest("#invertBtn")) return;

  const oldSlide = slides[currentSlide];

  // Posuň na ďalší slide alebo vráť na začiatok
  currentSlide = (currentSlide + 1) % slides.length;
  const newSlide = slides[currentSlide];

  // Fade out starý slide
  gsap.to(oldSlide, {
    opacity: 0,
    duration: 0.4,
    onComplete: () => {
      oldSlide.classList.add("hidden-slide");

      // Fade in nový slide
      newSlide.classList.remove("hidden-slide");
      gsap.fromTo(newSlide, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    },
  });
});

// ----------------------------------------
function initializeApp() {
  const parallax_el = document.querySelectorAll(".parallax");
  let xValue = 0,
    yValue = 0,
    rotateDegree = 0;

  function update(cursorX) {
    parallax_el.forEach((el) => {
      const speedx = +el.dataset.speedx;
      const speedy = +el.dataset.speedy;
      const speedz = +el.dataset.speedz;
      const rotateSpeed = +el.dataset.rotation;

      const isInLeft =
        parseFloat(getComputedStyle(el).left) < window.innerWidth / 2 ? 1 : -1;

      const zValue =
        (cursorX - parseFloat(getComputedStyle(el).left)) * isInLeft * 0.15;

      el.style.transform = `
        perspective(1200px)
        translateZ(${zValue * speedz}px)
        rotateY(${rotateDegree * rotateSpeed}deg)
        translateX(calc(-50% + ${-xValue * speedx}px))
        translateY(calc(-50% + ${-yValue * speedy}px))
      `;
    });
  }

  window.addEventListener("mousemove", (e) => {
    if (timeline.isActive()) return;

    xValue = e.clientX - window.innerWidth / 2;
    yValue = e.clientY - window.innerHeight / 2;
    rotateDegree = (xValue / (window.innerWidth / 2)) * 20;

    update(e.clientX);
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      if (timeline.isActive()) return;
      if (e.touches.length === 0) return;

      const t = e.touches[0];
      xValue = t.clientX - window.innerWidth / 2;
      yValue = t.clientY - window.innerHeight / 2;
      rotateDegree = (xValue / (window.innerWidth / 2)) * 20;

      update(t.clientX);
    },
    { passive: true }
  );

  let timeline = gsap.timeline();

  Array.from(parallax_el)
    .filter((el) => !el.classList.contains("text"))
    .forEach((el) => {
      const distance = parseFloat(el.dataset.distance);
      timeline.from(
        el,
        {
          top: `${el.offsetHeight / 2 + distance}px`,
          duration: 2.5,
          ease: "power3.out",
        },
        "1"
      );
    });

  timeline
    .from(
      ".content-slide:first-child .content h2",
      {
        opacity: 0,
        y: -50,
        duration: 1.2,
      },
      "2"
    )
    .from(
      ".content-slide:first-child .content h1",
      {
        opacity: 0,
        y: 50,
        duration: 1.2,
      },
      "2.2"
    )
    .from(
      ".content-slide:first-child .content h4",
      {
        opacity: 0,
        duration: 1.2,
      },
      "2.4"
    );
}

// ----------------------------------------
// PREPÍNANIE TÉMY
// ---------------------------------------
const invertBtn = document.getElementById("invertBtn");
let inverted = false;

invertBtn.addEventListener("click", () => {
  inverted = !inverted;

  // Prepnutie farieb
  document.documentElement.style.setProperty(
    "--circle-color",
    inverted ? "#00ffe0" : "#ff4500"
  );
  document.documentElement.style.setProperty(
    "--circle-glow",
    inverted ? "rgba(0,255,224,0.7)" : "rgba(255,69,0,0.7)"
  );

  // Prepnutie textov
  document
    .querySelectorAll(".normal-theme")
    .forEach((el) => el.classList.toggle("hidden", inverted));

  document
    .querySelectorAll(".invert-theme")
    .forEach((el) => el.classList.toggle("hidden", !inverted));

  // Prepnutie obrázkov s fade
  const cloudImgs = document.querySelectorAll(".parallax.cloud, .parallax.bg-img");

cloudImgs.forEach(img => {
  const originalOpacity = parseFloat(getComputedStyle(img).opacity);

  gsap.to(img, {
    opacity: 0,
    duration: 0.25,
    onComplete: () => {
      const src = img.src;
      const dot = src.lastIndexOf(".");
      img.src = src.includes("Inf")
        ? src.replace("Inf", "")
        : src.slice(0, dot) + "Inf" + src.slice(dot);

      gsap.to(img, { opacity: originalOpacity, duration: 0.25 });
    }
  });
});


  // ------------------------------
  // Reset slideshow na prvý slide
  // ------------------------------
  slides.forEach((s) => s.classList.add("hidden-slide"));
  currentSlide = 0;
  const firstSlide = slides[currentSlide];
  firstSlide.classList.remove("hidden-slide");
  gsap.set(firstSlide, { opacity: 1 }); // pridaj toto

  // Animácie textu prvého slide
  const firstContent = firstSlide.querySelector(".content:not(.hidden)");
  firstContent
    .querySelectorAll("h2, h1, h4")
    .forEach((el) => gsap.set(el, { opacity: 0 }));

  gsap.fromTo(
    firstContent.querySelector("h2"),
    { opacity: 0, y: -50 },
    { opacity: 1, y: 0, duration: 1.2 }
  );
  gsap.fromTo(
    firstContent.querySelector("h1"),
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1.2, delay: 0.2 }
  );
  gsap.fromTo(
    firstContent.querySelector("h4"),
    { opacity: 0 },
    { opacity: 1, duration: 1.2, delay: 0.4 }
  );
});
