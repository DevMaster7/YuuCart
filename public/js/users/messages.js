// Minimal, dependency-free JavaScript for opening messages in a modal
(async function () {
    let res = await fetch("/user/getUser", {
        method: 'get',
        headers: { 'Content-Type': 'application/json' },
    });
    let data = await res.json();
    data.user.messages.reverse().forEach(msg => {
        let date = new Date(msg.sendingDate).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });
        let msgHTML = `<article class="msg ${msg.seen ? "active" : ""}" data-id="${msg._id}" role="listitem" data-id="1" aria-label="${msg.from}">
                            <div class="msg-body">
                                <div class="row">
                                    <div style="display:flex;align-items:center;gap:12px">    
                                        <img class="avatar" src="${msg.fromImg}" alt="">
                                        <div>    
                                            <div class="name">${msg.from}</div>
                                            <div class="time">${date}</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="text" id="textContent">
                                    ${msg.textContent}
                                </div>
                            </div>
                        </article>`
        document.querySelector('.messages').innerHTML += msgHTML
    });

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

    async function openAt(index) {
        const el = msgs[index];
        if (!el) return;
        currentIndex = index;

        if (el.classList.contains('active')) {
            await fetch("/user/editMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: el.dataset.id
                })
            })
            el.classList.remove('active');
        }

        const name = el.querySelector('.name').textContent.trim();
        const time = el.querySelector('.time').textContent.trim();
        const avatar = el.querySelector('.avatar').src;
        const text = el.querySelector('.text').innerHTML;

        modalTitle.textContent = name;
        modalTime.textContent = time;
        modalAvatar.src = avatar;
        modalBody.innerHTML = text;

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