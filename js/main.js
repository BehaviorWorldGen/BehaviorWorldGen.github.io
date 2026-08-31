// Section loader for local Live Server / GitHub Pages
async function loadSections() {
    // Resolve includes repeatedly so nested data-include slots
    // (e.g. authors.html embedded inside the hero) are also loaded.
    let slots = document.querySelectorAll('[data-include]');

    while (slots.length) {
        await Promise.all(Array.from(slots).map(async (slot) => {
            const file = slot.getAttribute('data-include');
            const separator = file.includes('?') ? '&' : '?';
            const response = await fetch(`${file}${separator}v=film-preview-1`, { cache: 'no-store' });

            if (!response.ok) {
                throw new Error(`Failed to load section: ${file}`);
            }

            slot.outerHTML = await response.text();
        }));

        slots = document.querySelectorAll('[data-include]');
    }
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

            // Authors & Affiliations collapse toggle
            document.querySelectorAll('.authors-toggle').forEach(toggle => {
                const panel = document.getElementById(toggle.getAttribute('aria-controls'));

                toggle.addEventListener('click', () => {
                    const expanded = toggle.getAttribute('aria-expanded') === 'true';
                    toggle.setAttribute('aria-expanded', String(!expanded));
                    if (panel) panel.classList.toggle('is-collapsed', expanded);
                });
            });

            // Film preview modal
            const filmModal = document.getElementById('film-preview-modal');
            const filmTrigger = document.querySelector('.film-preview-trigger');
            const filmVideo = filmModal?.querySelector('video');
            const filmCloseButton = filmModal?.querySelector('.film-modal-close');

            function openFilmModal() {
                if (!filmModal || !filmVideo) return;
                filmModal.hidden = false;
                document.body.classList.add('film-modal-open');
                filmCloseButton?.focus();
                filmVideo.currentTime = 0;
                filmVideo.play().catch(() => {
                    // Native controls remain available if autoplay is blocked.
                });
            }

            function closeFilmModal() {
                if (!filmModal || filmModal.hidden) return;
                filmVideo?.pause();
                if (filmVideo) filmVideo.currentTime = 0;
                filmModal.hidden = true;
                document.body.classList.remove('film-modal-open');
                filmTrigger?.focus();
            }

            filmTrigger?.addEventListener('click', openFilmModal);
            filmModal?.querySelectorAll('[data-film-close]').forEach(control => {
                control.addEventListener('click', closeFilmModal);
            });
            document.addEventListener('keydown', event => {
                if (event.key === 'Escape' && filmModal && !filmModal.hidden) closeFilmModal();
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

            // Lazy video playback: load/play only while a video is visible.
            const videoVisibilityObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    const video = entry.target;

                    if (entry.isIntersecting) {
                        video.play().catch(() => {
                            // Some browsers may still require interaction before playback.
                        });
                    } else {
                        video.pause();
                    }
                });
            }, {
                threshold: 0.15
            });

            document.querySelectorAll('video').forEach(video => {
                videoVisibilityObserver.observe(video);
            });

            // 30-second rollout video switcher
            document.querySelectorAll('.rollout-showcase').forEach(showcase => {
                const video = showcase.querySelector('.rollout-player video');
                const source = video?.querySelector('source');
                const tabs = showcase.querySelectorAll('.rollout-tab');
                const originalTrajectory = showcase.querySelector('[data-trajectory-label="original"]');
                const editedTrajectory = showcase.querySelector('[data-trajectory-label="edited"]');

                tabs.forEach(tab => {
                    tab.addEventListener('click', () => {
                        tabs.forEach(item => {
                            const isActive = item === tab;
                            item.classList.toggle('is-active', isActive);
                            item.setAttribute('aria-selected', String(isActive));
                        });

                        if (!video || !source) return;

                        const nextSrc = tab.dataset.videoSrc;

                        if (originalTrajectory) originalTrajectory.textContent = tab.dataset.originalTrajectory || '';
                        if (editedTrajectory) editedTrajectory.textContent = tab.dataset.editedTrajectory || '';

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

            // Weather style-transfer timeline
            document.querySelectorAll('.style-transfer-showcase').forEach(showcase => {
                const timeline = showcase.querySelector('.weather-timeline');
                const video = showcase.querySelector('.style-transfer-player video');
                const stages = timeline?.querySelectorAll('.weather-stage');

                if (!timeline || !video || !stages?.length) return;

                const stageCount = stages.length;
                let timelineAnimationFrame;

                function syncWeatherTimeline() {
                    const progress = Number.isFinite(video.duration) && video.duration > 0
                        ? Math.min(Math.max(video.currentTime / video.duration, 0), 1)
                        : 0;
                    const activeStage = Math.min(Math.floor(progress * stageCount), stageCount - 1);

                    timeline.style.setProperty('--weather-progress', `${progress * 100}%`);
                    stages.forEach((stage, index) => {
                        const isActive = index === activeStage;
                        stage.classList.toggle('is-active', isActive);
                        stage.setAttribute('aria-current', isActive ? 'true' : 'false');
                    });
                }

                function animateWeatherTimeline() {
                    syncWeatherTimeline();
                    timelineAnimationFrame = requestAnimationFrame(animateWeatherTimeline);
                }

                function startWeatherTimelineAnimation() {
                    cancelAnimationFrame(timelineAnimationFrame);
                    timelineAnimationFrame = requestAnimationFrame(animateWeatherTimeline);
                }

                function stopWeatherTimelineAnimation() {
                    cancelAnimationFrame(timelineAnimationFrame);
                    syncWeatherTimeline();
                }

                stages.forEach((stage, index) => {
                    stage.addEventListener('click', () => {
                        if (!Number.isFinite(video.duration)) return;
                        video.currentTime = video.duration * ((index + 0.01) / stageCount);
                        syncWeatherTimeline();
                    });
                });

                video.addEventListener('loadedmetadata', syncWeatherTimeline);
                video.addEventListener('play', startWeatherTimelineAnimation);
                video.addEventListener('pause', stopWeatherTimelineAnimation);
                video.addEventListener('timeupdate', syncWeatherTimeline);
                video.addEventListener('seeked', syncWeatherTimeline);
                video.addEventListener('ended', syncWeatherTimeline);
                syncWeatherTimeline();
                if (!video.paused) startWeatherTimelineAnimation();
            });

            // Continuously increasing fog-density timeline
            document.querySelectorAll('.fog-transfer-showcase').forEach(showcase => {
                const timeline = showcase.querySelector('.fog-density-timeline');
                const track = timeline?.querySelector('.fog-density-track');
                const value = timeline?.querySelector('.fog-density-value');
                const video = showcase.querySelector('.fog-transfer-player video');

                if (!timeline || !track || !value || !video) return;

                let fogAnimationFrame;

                function syncFogDensity() {
                    const progress = Number.isFinite(video.duration) && video.duration > 0
                        ? Math.min(Math.max(video.currentTime / video.duration, 0), 1)
                        : 0;
                    const percentage = Math.round(progress * 100);

                    timeline.style.setProperty('--fog-progress', `${progress * 100}%`);
                    value.textContent = `${percentage}%`;
                    track.setAttribute('aria-valuenow', String(percentage));
                    track.setAttribute('aria-valuetext', `Fog density ${percentage}%`);
                }

                function animateFogDensity() {
                    syncFogDensity();
                    fogAnimationFrame = requestAnimationFrame(animateFogDensity);
                }

                function startFogDensityAnimation() {
                    cancelAnimationFrame(fogAnimationFrame);
                    fogAnimationFrame = requestAnimationFrame(animateFogDensity);
                }

                function stopFogDensityAnimation() {
                    cancelAnimationFrame(fogAnimationFrame);
                    syncFogDensity();
                }

                track.addEventListener('click', event => {
                    if (!Number.isFinite(video.duration)) return;
                    const bounds = track.getBoundingClientRect();
                    const progress = Math.min(Math.max((event.clientX - bounds.left) / bounds.width, 0), 1);
                    video.currentTime = video.duration * progress;
                    syncFogDensity();
                });

                track.addEventListener('keydown', event => {
                    if (!Number.isFinite(video.duration)) return;
                    const keyDirection = event.key === 'ArrowRight' || event.key === 'ArrowUp'
                        ? 1
                        : event.key === 'ArrowLeft' || event.key === 'ArrowDown'
                            ? -1
                            : 0;

                    if (!keyDirection) return;
                    event.preventDefault();
                    video.currentTime = Math.min(Math.max(video.currentTime + video.duration * 0.02 * keyDirection, 0), video.duration);
                    syncFogDensity();
                });

                video.addEventListener('loadedmetadata', syncFogDensity);
                video.addEventListener('play', startFogDensityAnimation);
                video.addEventListener('pause', stopFogDensityAnimation);
                video.addEventListener('timeupdate', syncFogDensity);
                video.addEventListener('seeked', syncFogDensity);
                video.addEventListener('ended', syncFogDensity);
                syncFogDensity();
                if (!video.paused) startFogDensityAnimation();
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
