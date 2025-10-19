// Minimal, dependency-free JavaScript for opening messages in a modal
(function () {
    const msgs = Array.from(document.querySelectorAll('.msg'));
    const backdrop = document.getElementById('modalBackdrop');
    const modalTitle = document.getElementById('modalTitle');
    const modalTime = document.getElementById('modalTime');
    const modalBody = document.getElementById('modalBody');
    const closeBtn = document.getElementById('closeBtn');
    const doneBtn = document.getElementById('doneBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    let currentIndex = -1;

    function openAt(index) {
        const el = msgs[index];
        if (!el) return;
        currentIndex = index;
        const name = el.querySelector('.name').textContent.trim();
        const time = el.querySelector('.time').textContent.trim();
        const text = el.querySelector('.text').textContent.trim();

        modalTitle.textContent = name;
        modalTime.textContent = time;
        modalBody.textContent = text;

        backdrop.style.display = 'flex';
        backdrop.setAttribute('aria-hidden', 'false');
        // focus management
        doneBtn.focus();
    }

    function closeModal() {
        backdrop.style.display = 'none';
        backdrop.setAttribute('aria-hidden', 'true');
        currentIndex = -1;
    }

    msgs.forEach((m, i) => {
        m.addEventListener('click', () => openAt(i));
        m.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') openAt(i);
        });
        m.setAttribute('tabindex', '0');
    });

    closeBtn.addEventListener('click', closeModal);
    doneBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
    });

    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) openAt(currentIndex - 1);
    });
    nextBtn.addEventListener('click', () => {
        if (currentIndex < msgs.length - 1) openAt(currentIndex + 1);
    });

    document.addEventListener('keydown', (e) => {
        if (backdrop.style.display === 'flex') {
            if (e.key === 'Escape') closeModal();
            if (e.key === 'ArrowLeft') prevBtn.click();
            if (e.key === 'ArrowRight') nextBtn.click();
        }
    });

    // update meta totals (in sidebar)
    const metaTotal = document.getElementById('metaTotal');
    if (metaTotal) metaTotal.textContent = msgs.length;

    // set initial aria-hidden
    backdrop.setAttribute('aria-hidden', 'true');
})();