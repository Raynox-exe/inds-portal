document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Toggle ---
    const navToggle = document.createElement('button');
    navToggle.className = 'mobile-nav-toggle';
    navToggle.innerHTML = '<span></span><span></span><span></span>';
    navToggle.setAttribute('aria-label', 'Toggle navigation');
    
    const navOverlay = document.createElement('div');
    navOverlay.className = 'main-nav-overlay';
    
    const header = document.querySelector('.header-content .container');
    const nav = document.querySelector('.main-nav');
    
    if (header && nav) {
        // Add toggle and overlay to DOM if not already there
        if (!document.querySelector('.mobile-nav-toggle')) {
            header.appendChild(navToggle);
            document.body.appendChild(navOverlay);
        }

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
