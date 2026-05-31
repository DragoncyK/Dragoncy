document.addEventListener("DOMContentLoaded", () => {
    // ID de Lanyard del usuario
    const lanyardAPI = "https://api.lanyard.rest/v1/users/738501782413639790";
    const spotifyWidget = document.getElementById("spotify-widget-content");
    const discordWidget = document.getElementById("discord-widget-content");

    const statusColors = {
        online: "#1db954", // Green
        idle: "#f0b90b",   // Gold
        dnd: "#ff2a6d",    // Pink
        offline: "#8b8b99" // Muted
    };

    function escapeHTML(str = "") {
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    async function updateLanyardStatus() {
        try {
            const response = await fetch(lanyardAPI, { cache: "no-store" });
            const json = await response.json();
            const data = json?.data;

            if (!data) throw new Error("No Lanyard data");

            // --- DISCORD STATUS ---
            const discordStatus = data.discord_status || "offline";
            const currentColor = statusColors[discordStatus] || statusColors.offline;
            const activities = Array.isArray(data.activities) ? data.activities : [];
            const gameActivity = activities.find((act) => act.id !== "spotify:1" && act.name);

            // Determinar texto de actividad
            let activityName = "None";
            let uptimeStr = "--";

            if (gameActivity) {
                activityName = escapeHTML(gameActivity.name);
                if (gameActivity.timestamps && gameActivity.timestamps.start) {
                    const diff = Date.now() - gameActivity.timestamps.start;
                    const hours = Math.floor(diff / 3600000);
                    const minutes = Math.floor((diff % 3600000) / 60000);
                    uptimeStr = `${hours}h ${minutes}m`;
                } else {
                    uptimeStr = "Active";
                }
            }

            discordWidget.innerHTML = `
                <div class="circle-visualizer heartbeat" style="border-color: ${currentColor};">
                    <div class="pulse-line" style="background: ${currentColor}; box-shadow: 0 0 10px ${currentColor};"></div>
                </div>
                <div class="widget-info">
                    <h4 class="white-text">
                        <span class="status-dot-small" style="background-color: ${currentColor}; box-shadow: 0 0 8px ${currentColor};"></span> 
                        ${escapeHTML(discordStatus.toUpperCase())}
                    </h4>
                    <p>${gameActivity ? escapeHTML(gameActivity.details || "In Session...") : "No active session detected. Waiting for connection..."}</p>
                    <div class="stats">
                        <div><span class="label">UPTIME</span><br>${uptimeStr}</div>
                        <div><span class="label">ACTIVITY</span><br>${activityName}</div>
                    </div>
                </div>
            `;

            // --- SPOTIFY STATUS ---
            if (data.spotify) {
                const track = data.spotify.song || "Unknown track";
                const artist = data.spotify.artist || "Unknown artist";
                const art = data.spotify.album_art_url || "";

                spotifyWidget.innerHTML = `
                    <div class="circle-visualizer" style="border:none; overflow:hidden;">
                        <img src="${escapeHTML(art)}" alt="Album art" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    <div class="widget-info">
                        <h4 class="white-text">${escapeHTML(track)}</h4>
                        <p>by ${escapeHTML(artist)}</p>
                    </div>
                `;
            } else {
                // Estado por defecto (No reproduciendo)
                spotifyWidget.innerHTML = `
                    <div class="circle-visualizer green-border"></div>
                    <div class="widget-info">
                        <h4 class="white-text">Not playing anything right now</h4>
                        <p>Start a track and it'll show up here.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Lanyard Connection Error:", error);
        }
    }

    // Inicializar y actualizar
    updateLanyardStatus();
    setInterval(updateLanyardStatus, 5000);
});
