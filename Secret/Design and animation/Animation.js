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

for(let i = 0; i < 4; i++) {
    setTimeout(createFloatingLyric, i * 2000);
}

setInterval(createFloatingLyric, 3500);

// ==========================================
// Custom Audio Player & Seamless Page Logic
// ==========================================
const bgMusic = document.getElementById('bg-music');
const playPauseBtn = document.getElementById('play-pause-btn');
const nextBtn = document.getElementById('next-btn'); // <-- Added Next Button
const volumeSlider = document.getElementById('volume-slider');
const entryScreen = document.getElementById('entry-screen');
const passwordInput = document.getElementById('site-password');
const entryMessage = document.getElementById('entry-message');
const countdownElement = document.getElementById('countdown');
const lockStatus = document.getElementById('lock-status');
const lockControls = document.getElementById('lock-controls');

// --- CONFIGURATION ---
const SECRET_PASSWORD = "101224"; // Set your passcode
const UNLOCK_DATE = new Date("June 7, 2026 00:00:00").getTime(); 

bgMusic.volume = volumeSlider.value;

// ==========================================
// Playlist Initialization
// ==========================================
const playlist = [
    "Secret/Music/Cas1.mp3",
    "Secret/Music/Arungi.mp3"
];

// Check memory to see which track was playing last, default to 0
let currentTrack = parseInt(localStorage.getItem('currentTrack')) || 0;

// Function to load a specific track
function loadTrack(index) {
    bgMusic.src = playlist[index];
    localStorage.setItem('currentTrack', index);
}

// Load the correct track immediately before checking the timeline!
loadTrack(currentTrack);

// Only lock the scrollbar if the entry screen exists on this page
if (entryScreen) {
    document.body.classList.add('locked');
}

// MAGIC TRICK 1: Check localStorage for VIP access
const isUnlocked = localStorage.getItem('siteUnlocked') === 'true';
const savedTime = localStorage.getItem('musicTime'); 

// Function to handle playing music and fading the screen
function letUserIn() {
    bgMusic.play();
    playPauseBtn.innerText = 'pause.';
    entryScreen.classList.add('fade-out');
    
    // Unlock the scrollbar so they can browse the site!
    document.body.classList.remove('locked');
    
    setTimeout(() => {
        if(entryScreen) entryScreen.remove();
    }, 1500);
}

// SCENARIO 1: The user has already unlocked the site (VIP Pass is Active)
if (isUnlocked && new Date().getTime() >= UNLOCK_DATE) {
    
    // Jump to the exact saved second in the song
    if (savedTime) bgMusic.currentTime = parseFloat(savedTime);
    
    // Attempt to automatically play the music
    let playPromise = bgMusic.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Success! 
            if (entryScreen) entryScreen.style.display = 'none';
            document.body.classList.remove('locked'); 
            playPauseBtn.innerText = 'pause.';
        }).catch(error => {
            // Blocked by browser on refresh! 
            if (entryScreen) {
                // If on Index, show click to resume screen
                if (countdownElement) countdownElement.style.display = 'none';
                if (passwordInput) passwordInput.style.display = 'none';
                if (lockControls) lockControls.style.display = 'flex';
                
                lockStatus.innerText = "welcome back.";
                entryMessage.innerText = "click anywhere to resume";
                entryScreen.addEventListener('click', letUserIn);
            } else {
                // If on Letters/Gallery, just unlock the page so they can click the play button
                document.body.classList.remove('locked');
            }
        });
    }
} 
// SCENARIO 2: The site is locked (VIP Pass is Missing)
else {
    
    // === SECURITY KICK-OUT LOGIC ===
    // If they are on Letters.html or Gallery.html but haven't unlocked the site yet, 
    // instantly kick them back to Index.html!
    if (!entryScreen) {
        window.location.href = 'Index.html';
    } 
    
    // === INDEX PAGE LOCK LOGIC ===
    else {
        // --- STRICT TIME LOCK & COUNTDOWN LOGIC ---
        function checkTimer() {
            if (!countdownElement) return true;

            const now = new Date().getTime();
            const distance = UNLOCK_DATE - now;

            if (distance <= 0) {
                // THE TIME HAS COME
                countdownElement.innerText = "Hint: Our first time talking with each other.";
                lockStatus.innerText = "welcome.";
                
                if (lockControls) lockControls.style.display = 'flex'; 
                return true; 
            } else {
                // STILL COUNTING DOWN
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

        // Locked Screen Password Logic
        if (entryScreen && passwordInput) {
            passwordInput.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    if (passwordInput.value === SECRET_PASSWORD) {
                        // Passcode Correct! Save VIP pass to localStorage
                        localStorage.setItem('siteUnlocked', 'true'); 
                        letUserIn();
                    } else {
                        // Passcode Incorrect
                        entryMessage.innerText = "incorrect passcode.";
                        entryMessage.classList.add('error');
                        passwordInput.value = ""; 
                        
                        setTimeout(() => {
                            entryMessage.innerText = "press enter to unlock";
                            entryMessage.classList.remove('error');
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

// Play / Pause Toggle Button
playPauseBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        playPauseBtn.innerText = 'pause.';
    } else {
        bgMusic.pause();
        playPauseBtn.innerText = 'play.';
    }
});

// Next Button Click Event
if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        currentTrack = (currentTrack + 1) % playlist.length; 
        loadTrack(currentTrack);
        
        let playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                playPauseBtn.innerText = 'pause.';
            }).catch(error => console.log("Playback prevented"));
        }
    });
}

// Auto-play the next song when the current one finishes naturally
bgMusic.addEventListener('ended', () => {
    currentTrack = (currentTrack + 1) % playlist.length;
    loadTrack(currentTrack);
    bgMusic.play().then(() => {
        playPauseBtn.innerText = 'pause.';
    });
});

// Update volume slider
volumeSlider.addEventListener('input', (e) => {
    bgMusic.volume = e.target.value;
});

// ==========================================
// THE MAGIC TRICK: Constantly save the timeline
// ==========================================
setInterval(() => {
    if (bgMusic && !bgMusic.paused) {
        localStorage.setItem('musicTime', bgMusic.currentTime);
        localStorage.setItem('musicPlaying', 'true');
    } else if (bgMusic && bgMusic.paused) {
        localStorage.setItem('musicPlaying', 'false');
    }
}, 500); 

// ==========================================
// Gallery Video Ducking (Desktop & Mobile Support)
// ==========================================
const galleryItems = document.querySelectorAll('.gallery-item');

// 1. Detect if the user is on a touch device (like a phone)
let isTouchDevice = false;
window.addEventListener('touchstart', () => {
    isTouchDevice = true;
}, { passive: true });

galleryItems.forEach(item => {
    const video = item.querySelector('video');
    
    if (video) {
        video.volume = 0.8; 

        // Function to Play Video & Lower Background Music
        const playVideo = () => {
            video.muted = false; 
            let playPromise = video.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    if (bgMusic && !bgMusic.paused) {
                        bgMusic.volume = 0.05; 
                    }
                }).catch(error => console.log("Autoplay blocked by phone browser"));
            }
        };

        // Function to Pause Video & Restore Background Music
        const pauseVideo = () => {
            video.pause();
            video.muted = true; 
            
            if (bgMusic && !bgMusic.paused) {
                bgMusic.volume = volumeSlider.value; 
            }
        };

        // --- DESKTOP LOGIC ---
        // Hover to play, move away to pause
        item.addEventListener('mouseenter', () => {
            if (!isTouchDevice) playVideo();
        });
        
        item.addEventListener('mouseleave', () => {
            if (!isTouchDevice) pauseVideo();
        });

        // --- MOBILE LOGIC ---
        // Tap once to play, tap again to pause
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
