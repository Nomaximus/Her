// --- Menu Logic ---
const menuBtn = document.getElementById('menu-toggle');
const menuOverlay = document.getElementById('menu-overlay');

menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    menuOverlay.classList.toggle('active');
});

// --- Floating Lyrics Logic ---
const casLyrics = [
    "got the music in you baby, tell me why",
    "kisses on the foreheads of the lovers wrapped in your arms",
    "when you're feeling low i will be there too",
    "you leapt from crumbling bridges watching cityscapes turn to dust",
    "I've been waiting for you to slip back in bed",
    "I know you want me, come out and haunt me",
    "it's so sweet knowing that you love me",
    "think I like you best when you're dressed in black",
    "dreaming with a filthy heart",
    "recurring visions of such sweet days",
    "we had made love earlier that day with no strings attached"
];

const lyricsContainer = document.getElementById('background-lyrics');

function createFloatingLyric() {
    if (!lyricsContainer) return;
    const lyric = document.createElement('span');
    lyric.className = 'floating-lyric';

    const randomText = casLyrics[Math.floor(Math.random() * casLyrics.length)];
    lyric.innerText = randomText;

    const maxX = window.innerWidth * 0.8; 
    const maxY = window.innerHeight * 0.8; 

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    lyric.style.left = `${randomX}px`;
    lyric.style.top = `${randomY}px`;

    lyricsContainer.appendChild(lyric);

    setTimeout(() => {
        lyric.remove();
    }, 15000); 
}

if (lyricsContainer) {
    for(let i = 0; i < 4; i++) {
        setTimeout(createFloatingLyric, i * 2000);
    }
    setInterval(createFloatingLyric, 3500);
}

// ==========================================
// Custom Audio Player & Seamless Page Logic
// ==========================================
const bgMusic = document.getElementById('bg-music');
const playPauseBtn = document.getElementById('play-pause-btn');
const nextBtn = document.getElementById('next-btn'); 
const volumeSlider = document.getElementById('volume-slider');
const entryScreen = document.getElementById('entry-screen');
const passwordInput = document.getElementById('site-password');
const entryMessage = document.getElementById('entry-message');
const countdownElement = document.getElementById('countdown');
const lockStatus = document.getElementById('lock-status');
const lockControls = document.getElementById('lock-controls');

// --- CONFIGURATION ---
const SECRET_PASSWORD = "101224"; 
const UNLOCK_DATE = new Date("June 7, 2026 00:00:00").getTime(); 

if (volumeSlider && bgMusic) {
    bgMusic.volume = volumeSlider.value;
}

// ==========================================
// Playlist Initialization
// ==========================================
const playlist = [
    "Secret/Music/Cas1.mp3",
    "Secret/Music/Arungi.mp3"
];

let currentTrack = parseInt(localStorage.getItem('currentTrack')) || 0;

function loadTrack(index) {
    if (!bgMusic) return;
    bgMusic.src = playlist[index];
    localStorage.setItem('currentTrack', index);
}

loadTrack(currentTrack);

if (entryScreen) {
    document.body.classList.add('locked');
}

const isUnlocked = localStorage.getItem('siteUnlocked') === 'true';
const savedTime = localStorage.getItem('musicTime'); 

function letUserIn() {
    if (!bgMusic) return;
    
    bgMusic.play().then(() => {
        if (savedTime) bgMusic.currentTime = parseFloat(savedTime);
    }).catch(err => console.log("Audio play deferred"));
    
    if (playPauseBtn) playPauseBtn.innerText = 'pause.';
    
    if (entryScreen) {
        entryScreen.classList.add('fade-out');
        setTimeout(() => {
            entryScreen.remove();
        }, 1500);
    }
    document.body.classList.remove('locked');
}

// SCENARIO 1: The user has already unlocked the site (VIP Pass is Active)
if (isUnlocked && new Date().getTime() >= UNLOCK_DATE) {
    
    let playPromise = bgMusic ? bgMusic.play() : undefined;
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Autoplay successfully bypassed browser security (usually on desktop)
            if (savedTime) bgMusic.currentTime = parseFloat(savedTime);
            if (entryScreen) entryScreen.style.display = 'none';
            document.body.classList.remove('locked'); 
            if (playPauseBtn) playPauseBtn.innerText = 'pause.';
        }).catch(error => {
            // Autoplay blocked by browser policy (Standard Mobile Behavior)
            if (entryScreen) {
                // Home page interaction fallback
                if (countdownElement) countdownElement.style.display = 'none';
                if (passwordInput) passwordInput.style.display = 'none';
                if (lockControls) lockControls.style.display = 'flex';
                
                if (lockStatus) lockStatus.innerText = "welcome back.";
                if (entryMessage) entryMessage.innerText = "click anywhere to resume";
                entryScreen.addEventListener('click', letUserIn);
            } else {
                // Subpages (Letters.html / Gallery.html) interaction fallback
                document.body.classList.remove('locked');
                
                // FIXED: Listens for the very first click/tap anywhere on this subpage to resume audio seamlessly
                const wakeUpAudio = () => {
                    const freshSavedTime = localStorage.getItem('musicTime');
                    bgMusic.play().then(() => {
                        if (freshSavedTime) bgMusic.currentTime = parseFloat(freshSavedTime);
                        if (playPauseBtn) playPauseBtn.innerText = 'pause.';
                        window.removeEventListener('click', wakeUpAudio);
                    }).catch(e => console.log("Waiting for user tap to activate audio context..."));
                };
                window.addEventListener('click', wakeUpAudio);
            }
        });
    }
} 
// SCENARIO 2: The site is locked (VIP Pass is Missing)
else {
    if (!entryScreen) {
        window.location.href = 'index.html';
    } else {
        function checkTimer() {
            if (!countdownElement) return true;

            const now = new Date().getTime();
            const distance = UNLOCK_DATE - now;

            if (distance <= 0) {
                countdownElement.innerText = "Hint: Our first time talking with each other.";
                if (lockStatus) lockStatus.innerText = "welcome.";
                if (lockControls) lockControls.style.display = 'flex'; 
                return true; 
            } else {
                if (lockControls) lockControls.style.display = 'none';

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                countdownElement.innerText = 
                    String(days).padStart(2, '0') + " : " + 
                    String(hours).padStart(2, '0') + " : " + 
                    String(minutes).padStart(2, '0') + " : " + 
                    String(seconds).padStart(2, '0');
                    
                return false; 
            }
        }

        const isTimeUp = checkTimer();

        if (!isTimeUp) {
            const timerInterval = setInterval(() => {
                if (checkTimer()) {
                    clearInterval(timerInterval); 
                }
            }, 1000);
        }

        if (passwordInput) {
            passwordInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.keyCode === 13) {
                    if (passwordInput.value === SECRET_PASSWORD) {
                        localStorage.setItem('siteUnlocked', 'true'); 
                        letUserIn();
                    } else {
                        if (entryMessage) {
                            entryMessage.innerText = "incorrect passcode.";
                            entryMessage.classList.add('error');
                        }
                        passwordInput.value = ""; 
                        
                        setTimeout(() => {
                            if (entryMessage) {
                                entryMessage.innerText = "press enter to unlock";
                                entryMessage.classList.remove('error');
                            }
                        }, 2000);
                    }
                }
            });
        }
    }
}

// ==========================================
// Audio Controls (Play, Pause, Next)
// ==========================================
if (playPauseBtn) {
    playPauseBtn.addEventListener('click', () => {
        if (!bgMusic) return;
        if (bgMusic.paused) {
            bgMusic.play();
            playPauseBtn.innerText = 'pause.';
        } else {
            bgMusic.pause();
            playPauseBtn.innerText = 'play.';
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        if (!bgMusic) return;
        currentTrack = (currentTrack + 1) % playlist.length; 
        loadTrack(currentTrack);
        
        bgMusic.play().then(() => {
            if (playPauseBtn) playPauseBtn.innerText = 'pause.';
        }).catch(error => console.log("Playback blocked"));
    });
}

if (bgMusic) {
    bgMusic.addEventListener('ended', () => {
        currentTrack = (currentTrack + 1) % playlist.length;
        loadTrack(currentTrack);
        bgMusic.play().then(() => {
            if (playPauseBtn) playPauseBtn.innerText = 'pause.';
        });
    });
}

if (volumeSlider && bgMusic) {
    volumeSlider.addEventListener('input', (e) => {
        bgMusic.volume = e.target.value;
    });
}

// Timeline tracker loop
setInterval(() => {
    if (bgMusic && !bgMusic.paused) {
        localStorage.setItem('musicTime', bgMusic.currentTime);
        localStorage.setItem('musicPlaying', 'true');
    } else if (bgMusic && bgMusic.paused) {
        localStorage.setItem('musicPlaying', 'false');
    }
}, 500); 

// ==========================================
// Gallery Video Ducking
// ==========================================
const galleryItems = document.querySelectorAll('.gallery-item');
let isTouchDevice = false;
window.addEventListener('touchstart', () => {
    isTouchDevice = true;
}, { passive: true });

galleryItems.forEach(item => {
    const video = item.querySelector('video');
    
    if (video) {
        video.volume = 0.8; 

        const playVideo = () => {
            video.muted = false; 
            let playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    if (bgMusic && !bgMusic.paused) {
                        bgMusic.volume = 0.05; 
                    }
                }).catch(error => console.log("Video autoplay blocked"));
            }
        };

        const pauseVideo = () => {
            video.pause();
            video.muted = true; 
            if (bgMusic && !bgMusic.paused && volumeSlider) {
                bgMusic.volume = volumeSlider.value; 
            }
        };

        item.addEventListener('mouseenter', () => {
            if (!isTouchDevice) playVideo();
        });
        
        item.addEventListener('mouseleave', () => {
            if (!isTouchDevice) pauseVideo();
        });

        item.addEventListener('click', () => {
            if (isTouchDevice) {
                if (video.paused) {
                    playVideo();
                } else {
                    pauseVideo();
                }
            }
        });
    }
});
