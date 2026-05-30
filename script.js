document.addEventListener("DOMContentLoaded", () => {
    // API de Lanyard
    const lanyardAPI = "https://api.lanyard.rest/v1/users/738501782413639790";

    async function updateLanyardStatus() {
        try {
            const response = await fetch(lanyardAPI);
            const json = await response.json();
            const data = json.data;
            
            // 1. ACTUALIZAR DISCORD STATUS
            const discordWidget = document.getElementById('discord-widget-content');
            const statusColors = { online: '#43b581', idle: '#faa61a', dnd: '#f04747', offline: '#747f8d' };
            const currentColor = statusColors[data.discord_status];
            
            // HTML para Discord (Más limpio y elegante)
            let htmlDiscord = `
                <div style="width: 100%;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
                        <div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${currentColor}; box-shadow: 0 0 12px ${currentColor};"></div>
                        <span style="font-weight: bold; color: #fff; font-size: 1.2rem; text-transform: uppercase;">${data.discord_status}</span>
                    </div>
            `;

            // Detectar juegos/actividades
            if (data.activities && data.activities.length > 0) {
                const gameActivity = data.activities.find(act => act.id !== "spotify:1");
                if (gameActivity) {
                    htmlDiscord += `
                        <div style="background: rgba(0,0,0,0.5); padding: 15px; border-left: 4px solid var(--neon-pink); border-radius: 6px;">
                            <p style="color: #aaa; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 5px;">Currently Executing</p>
                            <p style="color: #fff; font-weight: bold; font-size: 1.1rem;">${gameActivity.name}</p>
                            ${gameActivity.details ? `<p style="font-size: 0.9rem; color: #ddd; margin-top: 4px;">${gameActivity.details}</p>` : ''}
                            ${gameActivity.state ? `<p style="font-size: 0.9rem; color: #ddd;">${gameActivity.state}</p>` : ''}
                        </div>
                    `;
                } else {
                    htmlDiscord += `<p style="color: #888; font-style: italic;">No operational simulations detected.</p>`;
                }
            } else {
                 htmlDiscord += `<p style="color: #888; font-style: italic;">Interface idle.</p>`;
            }
            htmlDiscord += `</div>`;
            discordWidget.innerHTML = htmlDiscord;

            // 2. ACTUALIZAR SPOTIFY STATUS
            const spotifyWidget = document.getElementById('spotify-widget-content');
            if (data.spotify) {
                spotifyWidget.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 20px; width: 100%;">
                        <img src="${data.spotify.album_art_url}" style="width: 90px; height: 90px; border-radius: 8px; box-shadow: 0 4px 15px rgba(29, 185, 84, 0.4);">
                        <div style="overflow: hidden;">
                            <p style="color: #1db954; font-weight: 900; font-size: 0.8rem; letter-spacing: 1px; margin-bottom: 5px;">▶ NOW PLAYING</p>
                            <p style="color: #fff; font-weight: bold; font-size: 1.2rem; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${data.spotify.song}</p>
                            <p style="font-size: 0.95rem; color: #ccc; margin-top: 3px;">${data.spotify.artist}</p>
                        </div>
                    </div>
                `;
            } else {
                spotifyWidget.innerHTML = `
                    <div style="text-align: left; width: 100%;">
                        <p style="color: #888; font-style: italic;">Audio channel offline.</p>
                    </div>
                `;
            }

        } catch (error) {
            console.error("Error API:", error);
        }
    }

    updateLanyardStatus();
    setInterval(updateLanyardStatus, 5000);
});
