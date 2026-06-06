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
