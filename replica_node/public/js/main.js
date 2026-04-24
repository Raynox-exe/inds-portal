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

    // --- Modal Functionality ---
    const modalOverlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    const modalClose = document.querySelector('.modal-close');
    const abstractBtns = document.querySelectorAll('.view-abstract');

    function openModal(title, text) {
        if (!modalOverlay || !modalContent) return;
        
        modalContent.innerHTML = `
            <h2>${title}</h2>
            <div class="modal-body">
                ${text}
            </div>
        `;
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    function closeModal() {
        if (!modalOverlay) return;
        modalOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    abstractBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const title = btn.getAttribute('data-title');
            const abstractId = btn.getAttribute('href').substring(1);
            const abstractSource = document.getElementById(abstractId);
            
            if (abstractSource) {
                openModal(title, abstractSource.innerHTML);
            }
        });
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
