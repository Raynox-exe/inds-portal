document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    let navToggle = document.querySelector('.mobile-nav-toggle');
    let navOverlay = document.querySelector('.main-nav-overlay');
    
    // Create overlay if not in HTML
    if (!navOverlay) {
        navOverlay = document.createElement('div');
        navOverlay.className = 'main-nav-overlay';
        document.body.appendChild(navOverlay);
    }
    
    const nav = document.querySelector('.main-nav');
    
    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            navToggle.classList.toggle('active');
            navOverlay.classList.toggle('active');
            document.body.classList.toggle('nav-open');
        });

        navOverlay.addEventListener('click', () => {
            nav.classList.remove('active');
            navToggle.classList.remove('active');
            navOverlay.classList.remove('active');
            document.body.classList.remove('nav-open');
        });
    }

    // --- Premium Modal Functionality ---
    const modalOverlay = document.getElementById('abstractModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalAuthors = document.getElementById('modalAuthors');
    const modalBody = document.getElementById('modalBody');
    const modalDownloadBtn = document.getElementById('modalDownloadBtn');
    const modalClose = document.getElementById('closeModal');
    const abstractBtns = document.querySelectorAll('.view-abstract-trigger, .view-abstract, .view-btn');

    function openModal(data) {
        if (!modalOverlay) return;
        
        if (modalTitle) modalTitle.textContent = data.title || '';
        if (modalAuthors) modalAuthors.textContent = data.authors ? 'By ' + data.authors : '';
        if (modalBody) modalBody.textContent = data.abstract || '';
        
        if (modalDownloadBtn && data.pdf && data.downloadEnabled) {
            modalDownloadBtn.href = '/uploads/published/' + data.pdf;
            modalDownloadBtn.style.display = 'flex';
        } else if (modalDownloadBtn) {
            modalDownloadBtn.style.display = 'none';
        }
        
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    // Event Delegation for Abstract Buttons (supports dynamically loaded content)
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.view-abstract-trigger, .view-abstract, .view-btn');
        if (btn) {
            e.preventDefault();
            const downloadEnabledAttr = btn.getAttribute('data-download-enabled');
            const data = {
                title: btn.getAttribute('data-title'),
                authors: btn.getAttribute('data-authors'),
                abstract: btn.getAttribute('data-abstract'),
                pdf: btn.getAttribute('data-pdf'),
                downloadEnabled: downloadEnabledAttr === null || downloadEnabledAttr === '1' || downloadEnabledAttr === 'true'
            };
            
            // If it's the old style with hidden div source
            if (!data.abstract) {
                const href = btn.getAttribute('href');
                if (href && href.startsWith('#')) {
                    const source = document.getElementById(href.substring(1));
                    if (source) data.abstract = source.innerText;
                }
            }

            openModal(data);
        }
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) closeModal();
        });
    }

    // --- Scroll Reveal Animation ---
    const revealCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => revealObserver.observe(el));

    // --- Sticky Header Scroll Effect ---
    window.addEventListener('scroll', () => {
        const headerTop = document.querySelector('.main-header');
        if (window.scrollY > 50) {
            headerTop.classList.add('scrolled');
        } else {
            headerTop.classList.remove('scrolled');
        }
    });
});
