// --- Config ---
const AUTOPLAY_MS = 3500; // time between slides
const TRANSITION_MS = 600; // MUST match CSS .track transition duration
const PAUSE_ON_HOVER = true;
const PAUSE_ON_FOCUS = true;

// --- Elements ---
const viewport = document.getElementById('viewport');
const track = document.getElementById('track');
const slides = Array.from(track.children);
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');
const dotsWrap = document.getElementById('dots');

// --- State ---
let slideIndex = 1; // start at first real slide AFTER we add clones
let width = () => viewport.clientWidth;
let autoplayTimer = null;
let isAnimating = false;

// --- Clone edges for seamless loop ---
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);
firstClone.setAttribute('data-clone', 'first');
lastClone.setAttribute('data-clone', 'last');
track.appendChild(firstClone);
track.insertBefore(lastClone, slides[0]);

// Update slides NodeList after cloning
const allSlides = Array.from(track.children);

// Set initial offset to the first real slide
function setOffset(index, withTransition = true) {
    if (!withTransition) track.style.transition = 'none';
    const x = -index * width();
    track.style.transform = `translate3d(${x}px,0,0)`;
    if (!withTransition) {
        // Force reflow then restore transition for next moves
        track.getBoundingClientRect();
        track.style.transition = '';
    }
}

// Build dots for real slides only
const realCount = allSlides.length - 2;
const dots = Array.from({
    length: realCount
}, (_, i) => {
    const b = document.createElement('button');
    b.className = 'dot';
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => goTo(i + 1));
    dotsWrap.appendChild(b);
    return b;
});

function updateDots() {
    const realIndex = normalize(slideIndex) - 1; // 0..realCount-1
    dots.forEach((d, i) => d.setAttribute('aria-current', i === realIndex ? 'true' : 'false'));
}

function normalize(i) {
    // Converts any slideIndex to a real slide number 1..realCount
    if (i <= 0) return realCount; // if at lastClone position, normalize to last real
    if (i > realCount) return 1; // if at firstClone position, normalize to first real
    return i;
}

function next() {
    moveTo(slideIndex + 1);
}

function prev() {
    moveTo(slideIndex - 1);
}

function moveTo(targetIndex) {
    if (isAnimating) return;
    isAnimating = true;
    slideIndex = targetIndex;
    setOffset(slideIndex, true);
    // After transition, if we are on a clone, jump to the mirrored real slide without animation
    if (slideIndex === 0) { // we are on lastClone visually
        slideIndex = realCount; // jump to last real
        setOffset(slideIndex, false);
    } else if (slideIndex === realCount + 1) { // we are on firstClone visually
        slideIndex = 1; // jump to first real
        setOffset(slideIndex, false);
    }
    updateDots();
    isAnimating = false;
}

function goTo(realIndex1Based) {
    if (isAnimating) return;
    slideIndex = realIndex1Based;
    moveTo(slideIndex);
}

function startAutoplay() {
    stopAutoplay();
    autoplayTimer = window.setInterval(() => {
        next();
    }, AUTOPLAY_MS);
}

function stopAutoplay() {
    if (autoplayTimer) window.clearInterval(autoplayTimer);
    autoplayTimer = null;
}

// Resize handling to keep slides aligned
window.addEventListener('resize', () => setOffset(slideIndex, false));

// Keyboard support
viewport.tabIndex = 0; // make focusable
viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
});

// Buttons
prevBtn.addEventListener('click', prev);
nextBtn.addEventListener('click', next);

// INIT
setOffset(slideIndex, false);
updateDots();
startAutoplay();

// Example: dynamically replace slides with API data
// You can fetch ad images/links and rebuild the track, then re-run init logic.