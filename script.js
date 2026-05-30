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
        threshold: 0.15, 
        rootMargin: "0px 0px -40px 0px" 
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = entry.target.classList.contains('cyber-card') ? 'translateY(0)' : 'scale(1)';
                entry.target.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                cardObserver.unobserve(entry.target); 
            }
        });
    }, observeOptions);

    cyberCards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = card.classList.contains('cyber-card') ? 'translateY(40px)' : 'scale(0.95)';
        cardObserver.observe(card);
    });

    console.log("%cConnection Established. Pilot 002 Status: ACTIVE.", "color: #ff3366; font-size: 20px; font-weight: bold;");

    // =========================================================
    // LANYARD API INTEGRATION (Live Discord & Spotify)
    // =========================================================
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
            const currentColor = statusColors[data.discord_status] || '#747f8d';
            
            let htmlDiscord = `
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px; width: 100%;">
                    <div style="width: 18px; height: 18px; border-radius: 50%; background-color: ${currentColor}; box-shadow: 0 0 15px ${currentColor};"></div>
                    <span style="text-transform: uppercase; font-weight: 900; letter-spacing: 1px; color: ${currentColor}; font-size: 1.2rem;">${data.discord_status}</span>
                </div>
            `;

            if (data.activities && data.activities.length > 0) {
                const gameActivity = data.activities.find(act => act.id !== "spotify:1");
                if (gameActivity) {
                    htmlDiscord += `
                        <div style="background: rgba(0,0,0,0.5); padding: 12px; border-left: 3px solid var(--clr-blue); width: 100%; border-radius: 0 6px 6px 0;">
                            <p style="color: #fff; font-size: 0.85rem; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.5px;">Executing Process:</p>
                            <p style="color: var(--clr-blue); font-weight: bold; font-size: 1.15rem; margin-bottom: 3px;">${gameActivity.name}</p>
                            ${gameActivity.details ? `<p style="font-size: 0.85rem; color: #eee; margin: 2px 0;">${gameActivity.details}</p>` : ''}
                            ${gameActivity.state ? `<p style="font-size: 0.85rem; color: #ccc; font-style: italic;">${gameActivity.state}</p>` : ''}
                        </div>
                    `;
                } else {
                    htmlDiscord += `<p style="color: #666; font-size: 0.9rem; width: 100%; text-align: left;">Sistemas en espera. Ninguna simulación de alta carga detectada.</p>`;
                }
            } else {
                 htmlDiscord += `<p style="color: #666; font-size: 0.9rem; width: 100%; text-align: left;">Desconectado del puente principal (Sin actividad).</p>`;
            }
            
            discordWidget.innerHTML = htmlDiscord;

            // 2. UPDATE SPOTIFY STATUS
            const spotifyWidget = document.getElementById('spotify-widget-content');
            if (data.spotify) {
                spotifyWidget.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 20px; text-align: left; width: 100%;">
                        <img src="${data.spotify.album_art_url}" style="width: 85px; height: 85px; border-radius: 8px; border: 2px solid #1db954; box-shadow: 0 0 15px rgba(29, 185, 84, 0.3);">
                        <div style="overflow: hidden; width: 100%;">
                            <p style="color: #1db954; font-weight: 900; font-size: 0.75rem; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 1px;">► Live Stream</p>
                            <p style="color: #fff; font-weight: bold; font-size: 1.1rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; margin: 0;">${data.spotify.song}</p>
                            <p style="font-size: 0.9rem; color: #b3b3b3; white-space: nowrap; text-overflow: ellipsis; overflow: hidden; margin: 2px 0 0 0;">by ${data.spotify.artist}</p>
                        </div>
                    </div>
                `;
            } else {
                spotifyWidget.innerHTML = `
                    <div style="text-align: center; width: 100%;">
                        <div style="font-size: 1.8rem; margin-bottom: 8px; opacity: 0.3;">🔇</div>
                        <p style="color: #555; font-size: 0.9rem; margin: 0;">Frecuencia de audio en espera...</p>
                    </div>
                `;
            }

        } catch (error) {
            console.error("Error connecting to Lanyard:", error);
        }
    }

    updateLanyardStatus();
    setInterval(updateLanyardStatus, 5000);
});
