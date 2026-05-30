document.addEventListener("DOMContentLoaded", () => {
    // ID de Lanyard (Mantengo el que pusiste)
    const lanyardAPI = "https://api.lanyard.rest/v1/users/738501782413639790";
    const spotifyWidget = document.getElementById("spotify-widget-content");
    const discordWidget = document.getElementById("discord-widget-content");

    const statusColors = {
        online: "#31d07d",
        idle: "#f7b955",
        dnd: "#ff4d6d",
        offline: "#7b8497"
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

            let discordHTML = `
                <div class="status-layout">
                    <div class="status-dot" style="background:${currentColor}; color:${currentColor};"></div>
                    <div class="status-copy">
                        <div class="status-name" style="color:${currentColor};">${escapeHTML(discordStatus.toUpperCase())}</div>
                        <div class="status-detail">Network connection stable.</div>
                    </div>
                </div>
            `;

            if (gameActivity) {
                discordHTML += `
                    <div class="activity-box">
                        <div class="activity-name">${escapeHTML(gameActivity.name)}</div>
                        ${gameActivity.details ? `<div class="activity-text">${escapeHTML(gameActivity.details)}</div>` : ""}
                        ${gameActivity.state ? `<div class="activity-text">${escapeHTML(gameActivity.state)}</div>` : ""}
                    </div>
                `;
            }

            discordWidget.innerHTML = discordHTML;

            // --- SPOTIFY STATUS ---
            if (data.spotify) {
                const track = data.spotify.song || "Unknown track";
                const artist = data.spotify.artist || "Unknown artist";
                const art = data.spotify.album_art_url || "";

                spotifyWidget.innerHTML = `
                    <div class="spotify-layout">
                        <img src="${escapeHTML(art)}" alt="Album art" class="spotify-art">
                        <div class="track-copy">
                            <div class="track-title">${escapeHTML(track)}</div>
                            <div class="track-artist">by ${escapeHTML(artist)}</div>
                            <div class="track-bar"><span></span></div>
                        </div>
                    </div>
                `;
            } else {
                spotifyWidget.innerHTML = `
                    <div class="status-layout">
                        <div class="status-dot" style="background:#7b8497; color:#7b8497;"></div>
                        <div class="status-copy">
                            <div class="status-name" style="color:#7b8497;">SILENT</div>
                            <div class="status-detail">No audio stream detected.</div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Lanyard Connection Error:", error);
            // Fallback silencioso en caso de error
        }
    }

    // Llamada inicial y bucle de actualización cada 5 segundos
    updateLanyardStatus();
    setInterval(updateLanyardStatus, 5000);
});
