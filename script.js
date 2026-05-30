document.addEventListener("DOMContentLoaded", () => {
    // --- Smooth Scrolling for Navigation ---
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Card Fade-In Effect on Scroll ---
    const cyberCards = document.querySelectorAll('.cyber-card, .gallery-item');
    
    const observeOptions = {
        threshold: 0.2, 
        rootMargin: "0px 0px -50px 0px" 
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = entry.target.classList.contains('cyber-card') ? 'translateY(0)' : 'scale(1)';
                entry.target.style.transition = 'all 0.6s ease-out';
                cardObserver.unobserve(entry.target); 
            }
        });
    }, observeOptions);

    cyberCards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = card.classList.contains('cyber-card') ? 'translateY(30px)' : 'scale(0.9)';
        cardObserver.observe(card);
    });

    console.log("%cConnection Established. Pilot 002 Status: ACTIVE.", "color: #ff3366; font-size: 20px; font-weight: bold;");

    // =========================================================
    // LANYARD API INTEGRATION (Live Discord & Spotify)
    // =========================================================
    
    // Fetching data from your specific Lanyard ID
    const lanyardAPI = "https://api.lanyard.rest/v1/users/738501782413639790";

    async function updateLanyardStatus() {
        try {
            const response = await fetch(lanyardAPI);
            const json = await response.json();
            const data = json.data;
            
            // 1. UPDATE DISCORD STATUS
            const discordWidget = document.getElementById('discord-widget-content');
            
            const statusColors = { 
                online: '#43b581', 
                idle: '#faa61a',   
                dnd: '#f04747',    
                offline: '#747f8d' 
            };
            const currentColor = statusColors[data.discord_status];
            
            let htmlDiscord = `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                    <div style="width: 18px; height: 18px; border-radius: 50%; background-color: ${currentColor}; box-shadow: 0 0 15px ${currentColor};"></div>
                    <span style="text-transform: uppercase; font-weight: 900; letter-spacing: 1px; color: ${currentColor}; font-size: 1.2rem;">${data.discord_status}</span>
                </div>
            `;

            // Detect active games/programs (filtering out Spotify)
            if (data.activities && data.activities.length > 0) {
                const gameActivity = data.activities.find(act => act.id !== "spotify:1");
                if (gameActivity) {
                    htmlDiscord += `
                        <div style="background: rgba(0,0,0,0.5); padding: 10px; border-left: 3px solid var(--clr-blue); width: 100%;">
                            <p style="color: #fff; font-size: 0.9rem;">Executing:</p>
                            <p style="color: var(--clr-blue); font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">${gameActivity.name}</p>
                            ${gameActivity.details ? `<p style="font-size: 0.8rem; color: #ccc;">${gameActivity.details}</p>` : ''}
                            ${gameActivity.state ? `<p style="font-size: 0.8rem; color: #ccc;">${gameActivity.state}</p>` : ''}
                        </div>
                    `;
                } else {
                    htmlDiscord += `<p style="color: #888; font-size: 0.9rem;">Systems on standby. No high-demand programs detected.</p>`;
                }
            } else {
                 htmlDiscord += `<p style="color: #888; font-size: 0.9rem;">Disconnected from simulation interface (No activity).</p>`;
            }
            
            discordWidget.innerHTML = htmlDiscord;

            // 2. UPDATE SPOTIFY STATUS
            const spotifyWidget = document.getElementById('spotify-widget-content');
            if (data.spotify) {
                spotifyWidget.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px; text-align: left; width: 100%;">
                        <img src="${data.spotify.album_art_url}" style="width: 90px; height: 90px; border-radius: 8px; border: 2px solid #1db954; box-shadow: 0 0 15px rgba(29, 185, 84, 0.4);">
                        <div style="overflow: hidden;">
                            <p style="color: #1db954; font-weight: 900; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 1px;">► Now Playing</p>
                            <p style="color: #fff; font-weight: bold; font-size: 1.1rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${data.spotify.song}</p>
                            <p style="font-size: 0.85rem; color: #aaa; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${data.spotify.artist}</p>
                        </div>
                    </div>
                `;
            } else {
                spotifyWidget.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; color: #333; margin-bottom: 10px;">🔇</div>
                        <p style="color: #666;">Audio channel inactive.</p>
                    </div>
                `;
            }

        } catch (error) {
            console.error("Error connecting to Lanyard database:", error);
        }
    }

    // Run the function immediately upon loading
    updateLanyardStatus();
    
    // Loop the check every 5 seconds to update the UI
    setInterval(updateLanyardStatus, 5000);
});
