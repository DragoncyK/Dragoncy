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

    // --- Card Fade-In Effect on Scroll (Intersection Observer) ---
    const cyberCards = document.querySelectorAll('.cyber-card');
    
    const observeOptions = {
        threshold: 0.15, // Trigger when 15% visible
        rootMargin: "0px 0px -50px 0px" // Slight offset
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                entry.target.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                cardObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, observeOptions);

    cyberCards.forEach(card => {
        // Initial State for Fade-in
        card.style.opacity = 0;
        card.style.transform = 'translateY(30px)';
        cardObserver.observe(card);
    });

    // Lanyard API Implementation for Megu's Status
    // Target user ID is from retrieved images: 738501782413639790
    const lanyardAPI = "https://api.lanyard.rest/v1/users/738501782413639790";

    async function updateLanyardStatus() {
        try {
            const response = await fetch(lanyardAPI);
            const json = await response.json();
            const data = json.data;
            
            // 1. UPDATE DISCORD (Pilot) STATUS
            const discordWidget = document.getElementById('discord-widget-content');
            const statusIndicator = document.querySelector('.status-tag');
            
            const statusColors = { online: '#43b581', idle: '#faa61a', dnd: '#f04747', offline: '#747f8d' };
            const currentColor = statusColors[data.discord_status];
            
            // Update the tag in the header as well
            if (statusIndicator) {
                statusIndicator.style.backgroundColor = currentColor;
                statusIndicator.textContent = data.discord_status.toUpperCase();
            }
            
            // Generate detailed Discord card HTML
            let htmlDiscord = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                    <div style="width: 15px; height: 15px; border-radius: 50%; background-color: ${currentColor}; box-shadow: 0 0 10px ${currentColor};"></div>
                    <span style="font-weight: bold; color: ${currentColor}; font-size: 1.1rem;">Currently ${data.discord_status}</span>
                </div>
            `;

            // Detect active games/programs (filtering out Spotify)
            if (data.activities && data.activities.length > 0) {
                const gameActivity = data.activities.find(act => act.id !== "spotify:1");
                if (gameActivity) {
                    htmlDiscord += `
                        <div style="background: rgba(0,0,0,0.4); padding: 10px; border-left: 3px solid var(--clr-details); border-radius: 5px;">
                            <p style="color: #fff;">Running:</p>
                            <p style="color: var(--clr-details); font-weight: bold;">${gameActivity.name}</p>
                            ${gameActivity.details ? `<p style="font-size: 0.8rem; color: #ccc;">${gameActivity.details}</p>` : ''}
                            ${gameActivity.state ? `<p style="font-size: 0.8rem; color: #ccc;">${gameActivity.state}</p>` : ''}
                        </div>
                    `;
                } else {
                    htmlDiscord += `<p style="color: #ccc;">Sistemas en espera. No operational simulations detected.</p>`;
                }
            } else {
                 htmlDiscord += `<p style="color: #ccc;">Disconnected from operational interface (No activity).</p>`;
            }
            
            discordWidget.innerHTML = htmlDiscord;

            // 2. UPDATE SPOTIFY STATUS
            const spotifyWidget = document.getElementById('spotify-widget-content');
            if (data.spotify) {
                spotifyWidget.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 15px; text-align: left;">
                        <img src="${data.spotify.album_art_url}" style="width: 80px; height: 80px; border-radius: 5px; border: 2px solid #1db954;">
                        <div style="overflow: hidden;">
                            <p style="color: #1db954; font-weight: bold; font-size: 0.8rem;">► Now Playing</p>
                            <p style="color: #fff; font-weight: bold; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${data.spotify.song}</p>
                            <p style="font-size: 0.9rem; color: #ccc;">by ${data.spotify.artist}</p>
                        </div>
                    </div>
                `;
            } else {
                spotifyWidget.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 2rem; color: #333;">🔇</div>
                        <p style="color: #555;">Canal de audio inactivo.</p>
                    </div>
                `;
            }

        } catch (error) {
            console.error("Error connecting to Lanyard API:", error);
        }
    }

    // Run immediately and every 5 seconds
    updateLanyardStatus();
    setInterval(updateLanyardStatus, 5000);
});
