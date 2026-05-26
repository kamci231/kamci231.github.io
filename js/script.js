document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.getElementById('header');
    let isScrolling = false;
    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    // 2. Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    mobileBtn.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // 3. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 4. Scroll Reveal Animation for Cards
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.card').forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) ${index * 0.1}s`;
        observer.observe(card);
    });

    // 5. Tag Modal Logic
    const modal = document.getElementById('tag-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const closeBtn = document.querySelector('.close-btn');

    document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const title = btn.getAttribute('data-title');
            const desc = btn.getAttribute('data-desc');
            
            modalTitle.textContent = title;
            modalDesc.textContent = desc;
            
            modal.style.display = 'flex';
            // Trigger reflow for transition
            void modal.offsetWidth;
            modal.classList.add('show');
        });
    });

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            if (!modal.classList.contains('show')) {
                modal.style.display = 'none';
            }
        }, 200);
    };

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Theme Modal Logic
    const themeModal = document.getElementById('theme-modal');
    const themeModalImage = document.getElementById('theme-modal-image');
    const themeModalTitle = document.getElementById('theme-modal-title');
    const themeModalDesc = document.getElementById('theme-modal-desc');
    const closeThemeModalBtn = document.querySelector('.close-theme-modal');

    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const title = card.getAttribute('data-title');
            const desc = card.getAttribute('data-desc');
            const image = card.getAttribute('data-image');
            
            themeModalTitle.textContent = title;
            themeModalDesc.textContent = desc;
            themeModalImage.src = image;
            
            themeModal.classList.add('active');
        });
    });

    const closeThemeModal = () => {
        themeModal.classList.remove('active');
    };

    if(closeThemeModalBtn) {
        closeThemeModalBtn.addEventListener('click', closeThemeModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === themeModal) {
            closeThemeModal();
        }
    });

    // Language Dropdown & Translation Logic
    const langBtn = document.querySelector('.lang-btn');
    const langList = document.querySelectorAll('.lang-list a');
    
    langList.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class
            langList.forEach(l => l.classList.remove('active'));
            item.classList.add('active');
            
            const langCode = item.getAttribute('data-lang');
            const langName = item.getAttribute('data-name');
            
            // Update button text
            if (langBtn) {
                langBtn.innerHTML = `🌐 ${langName} <span class="arrow">▼</span>`;
            }
            
            if (langCode === 'ko') {
                // To revert back to Korean, clear cookies and reload
                document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=" + location.hostname + "; path=/;";
                window.location.reload();
                return;
            }
            
            // Trigger Google Translate for other languages
            const gtSelect = document.querySelector('.goog-te-combo');
            if (gtSelect) {
                gtSelect.value = langCode;
                gtSelect.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
            }
        });
    });

    // Shooting Stars Logic
    const starsContainer = document.getElementById('shooting-stars-container');
    
    function createShootingStar() {
        if (!starsContainer) return;
        
        const star = document.createElement('div');
        star.classList.add('shooting-star');
        
        // Random starting position (mostly top and right edges)
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * (window.innerHeight * 0.5); // Top half
        
        // Random angle (e.g., 35 to 55 degrees down-right)
        const angle = Math.random() * 20 + 35;
        
        // Random duration (1.5s to 3s)
        const duration = Math.random() * 1.5 + 1.5;
        
        star.style.left = `${startX}px`;
        star.style.top = `${startY}px`;
        star.style.setProperty('--angle', `${angle}deg`);
        star.style.animationDuration = `${duration}s`;
        
        starsContainer.appendChild(star);
        
        // Remove after animation completes
        setTimeout(() => {
            if (star.parentNode) {
                star.parentNode.removeChild(star);
            }
        }, duration * 1000 + 200);
    }
    
    function scheduleNextStar() {
        // Drop 2 or 3 stars at once
        const starCount = Math.floor(Math.random() * 2) + 2; // Returns 2 or 3
        
        for (let i = 0; i < starCount; i++) {
            // Slight delay so they don't spawn at the exact same millisecond
            setTimeout(() => {
                createShootingStar();
            }, Math.random() * 600); // 0 to 0.6s offset
        }

        // Fall 2x more frequently, e.g., every 0.75s to 2.25s
        const nextDelay = Math.random() * 1500 + 750;
        setTimeout(scheduleNextStar, nextDelay);
    }
    
    // Start the shooting stars
    if(starsContainer) {
        setTimeout(scheduleNextStar, 1000);
    }

    // Helper function to show a premium toast notification
    function showToast(message, isError = false) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        if (isError) toast.classList.add('error');
        
        toast.innerHTML = isError ? `❌ ${message}` : `✔️ ${message}`;
        document.body.appendChild(toast);
        
        // Trigger show animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide and remove after 4 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    }

    // EmailJS Inquiry Form Integration
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit-btn');
    
    if (contactForm && submitBtn) {
        const btnText = submitBtn.querySelector('.btn-text');
        const spinner = submitBtn.querySelector('.spinner-btn');
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic input validations
            const fromName = document.getElementById('from_name').value.trim();
            const replyTo = document.getElementById('reply_to').value.trim();
            const messageVal = document.getElementById('message').value.trim();
            const consentChecked = document.getElementById('consent').checked;
            
            if (!fromName || !replyTo || !messageVal) {
                showToast("모든 필수 입력 항목을 채워주세요.", true);
                return;
            }
            
            if (!consentChecked) {
                showToast("개인정보 수집 동의가 필요합니다.", true);
                return;
            }
            
            // Set loading state on button
            submitBtn.disabled = true;
            if (btnText) btnText.textContent = "전송 중...";
            if (spinner) spinner.style.display = "inline-block";
            
            // Trigger EmailJS Form Send
            // service_j5s7e7v, template_yf6jnyb
            emailjs.sendForm('service_j5s7e7v', 'template_yf6jnyb', this)
                .then(() => {
                    showToast("문의가 성공적으로 수신되었습니다! 📨");
                    contactForm.reset();
                })
                .catch((error) => {
                    console.error("EmailJS Error:", error);
                    showToast("이메일 전송에 실패하였습니다. 다시 시도해 주세요.", true);
                })
                .finally(() => {
                    // Reset button state
                    submitBtn.disabled = false;
                    if (btnText) btnText.textContent = "📨 문의하기 전송";
                    if (spinner) spinner.style.display = "none";
                });
        });
    }
});
