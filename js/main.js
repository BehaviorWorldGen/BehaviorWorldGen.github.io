// Section loader for local Live Server / GitHub Pages
async function loadSections() {
    const slots = document.querySelectorAll('[data-include]');

    await Promise.all(Array.from(slots).map(async (slot) => {
        const file = slot.getAttribute('data-include');
        const response = await fetch(file);

        if (!response.ok) {
            throw new Error(`Failed to load section: ${file}`);
        }

        slot.outerHTML = await response.text();
    }));
}

function initPageInteractions() {
    // Scroll Reveal Animation
            const revealObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -60px 0px'
            });
    
            document.querySelectorAll('.reveal').forEach(el => {
                revealObserver.observe(el);
            });
    
            // Custom Video Player — play/pause only, no fullscreen, no download
            document.querySelectorAll('.video-wrapper').forEach(wrapper => {
                const video  = wrapper.querySelector('video');
                const pauseIcon = wrapper.querySelector('.v-icon-pause');
                const playIcon  = wrapper.querySelector('.v-icon-play');
                const status    = wrapper.querySelector('.v-status');
    
                function syncUI() {
                    if (video.paused) {
                        wrapper.classList.add('is-paused');
                        if (pauseIcon) pauseIcon.style.display = 'none';
                        if (playIcon)  playIcon.style.display  = '';
                        if (status)    status.textContent = '继续播放';
                    } else {
                        wrapper.classList.remove('is-paused');
                        if (pauseIcon) pauseIcon.style.display = '';
                        if (playIcon)  playIcon.style.display  = 'none';
                        if (status)    status.textContent = '暂停';
                    }
                }
    
                wrapper.addEventListener('click', () => {
                    video.paused ? video.play() : video.pause();
                });
    
                video.addEventListener('play',  syncUI);
                video.addEventListener('pause', syncUI);
            });

            // 30-second rollout video switcher
            document.querySelectorAll('.rollout-showcase').forEach(showcase => {
                const video = showcase.querySelector('.rollout-player video');
                const source = video?.querySelector('source');
                const tabs = showcase.querySelectorAll('.rollout-tab');

                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        tabs.forEach(item => {
                            const isActive = item === tab;
                            item.classList.toggle('is-active', isActive);
                            item.setAttribute('aria-selected', String(isActive));
                        });

                        if (!video || !source) return;

                        const nextSrc = tab.dataset.videoSrc;

                        if (source.getAttribute('src') !== nextSrc) {
                            source.setAttribute('src', nextSrc);
                            video.load();
                        } else {
                            video.currentTime = 0;
                        }

                        video.play().catch(() => {
                            // The browser may still require the user to use its native play control.
                        });
                    });
                });
            });

            // 3D Gaussian Splatting case switcher
            document.querySelectorAll('.gaussian-splatting-showcase').forEach(showcase => {
                const video = showcase.querySelector('.gaussian-splatting-player video');
                const source = video?.querySelector('source');
                const tabs = showcase.querySelectorAll('.gaussian-splatting-tab');

                if (!video || !source) return;

                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const nextSrc = tab.dataset.videoSrc;

                        tabs.forEach(item => {
                            const isActive = item === tab;
                            item.classList.toggle('is-active', isActive);
                            item.setAttribute('aria-selected', String(isActive));
                        });

                        if (source.getAttribute('src') !== nextSrc) {
                            source.setAttribute('src', nextSrc);
                            video.load();
                        } else {
                            video.currentTime = 0;
                        }

                        video.play().catch(() => {
                            // The browser may still require the user to use its native play control.
                        });
                    });
                });
            });

            // World simulator construction method switcher
            document.querySelectorAll('.rollout-results').forEach(section => {
                const tabs = section.querySelectorAll('.world-simulator-tab');
                const panels = section.querySelectorAll('.world-simulator-panel');

                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        const selectedPanelId = tab.dataset.panel;

                        tabs.forEach(item => {
                            const isActive = item === tab;
                            item.classList.toggle('is-active', isActive);
                            item.setAttribute('aria-selected', String(isActive));
                        });

                        panels.forEach(panel => {
                            panel.hidden = panel.id !== selectedPanelId;
                        });
                    });
                });
            });
    
            // Nav Background on Scroll
            window.addEventListener('scroll', () => {
                const nav = document.querySelector('nav');
                if (window.scrollY > 40) {
                    nav.style.background = 'rgba(255, 255, 255, 0.98)';
                } else {
                    nav.style.background = 'rgba(255, 255, 255, 0.92)';
                }
            });
    
            // Smooth Scroll for Nav Links
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
}

loadSections()
    .then(initPageInteractions)
    .catch((error) => {
        console.error(error);
        document.body.insertAdjacentHTML('beforeend', '<p style="padding: 24px; color: #ff6961;">页面区块加载失败，请确认正在通过 Live Server 或 HTTP 服务访问。</p>');
    });
