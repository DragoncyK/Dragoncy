document.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll(".reveal");
    const navLinks = document.querySelectorAll(".top-nav a");

    // Smooth scroll for nav
    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute("href"));
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    // Reveal animation
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.14,
        rootMargin: "0px 0px -60px 0px"
    });

    revealElements.forEach((el) => revealObserver.observe(el));

    // Active nav link
    const sections = document.querySelectorAll("section[id]");
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            navLinks.forEach((a) => a.classList.remove("active"));
            const active = document.querySelector(`.top-nav a[href="#${entry.target.id}"]`);
            if (active) active.classList.add("active");
        });
    }, {
        threshold: 0.5
    });

    sections.forEach((section) => sectionObserver.observe(section));

    // Lanyard API integration
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

            if (!data) {
                throw new Error("No data received");
            }

            // Discord / pilot status
            const discordStatus = data.discord_status || "offline";
            const currentColor = statusColors[discordStatus] || statusColors.offline;
            const activities = Array.isArray(data.activities) ? data.activities : [];
            const gameActivity = activities.find((act) => act.id !== "spotify:1" && act.name);

            let discordHTML = `
                <div class="status-layout">
                    <div class="status-dot" style="color:${currentColor}; background:${currentColor};"></div>
                    <div class="status-copy">
                        <div class="status-name" style="color:${currentColor};">${escapeHTML(discordStatus.toUpperCase())}</div>
                        <div class="status-detail">Connection ${discordStatus === "offline" ? "interrupted" : "stable"}.</div>
                    </div>
                </div>
            `;

            if (gameActivity) {
                discordHTML += `
                    <div class="activity-box">
                        <div class="activity-label">Executing process</div>
                        <div class="activity-name">${escapeHTML(gameActivity.name)}</div>
                        ${gameActivity.details ? `<div class="activity-text">${escapeHTML(gameActivity.details)}</div>` : ""}
                        ${gameActivity.state ? `<div class="activity-text">${escapeHTML(gameActivity.state)}</div>` : ""}
                    </div>
                `;
            } else {
                discordHTML += `
                    <div class="activity-box">
                        <div class="activity-label">Executing process</div>
                        <div class="activity-text">No active high-load simulation detected.</div>
                    </div>
                `;
            }

            discordWidget.innerHTML = discordHTML;

            // Spotify
            if (data.spotify) {
                const track = data.spotify.song || "Unknown track";
                const artist = data.spotify.artist || "Unknown artist";
                const art = data.spotify.album_art_url || "";

                spotifyWidget.innerHTML = `
                    <div class="spotify-layout">
                        <img src="${escapeHTML(art)}" alt="Album art" class="spotify-art">
                        <div class="track-copy">
                            <div class="track-badge">Live Stream</div>
                            <div class="track-title">${escapeHTML(track)}</div>
                            <div class="track-artist">by ${escapeHTML(artist)}</div>
                            <div class="track-bar"><span></span></div>
                        </div>
                    </div>
                `;
            } else {
                spotifyWidget.innerHTML = `
                    <div style="text-align:left; width:100%;">
                        <div class="widget-placeholder">No audio detected right now.</div>
                    </div>
                `;
            }
        } catch (error) {
            console.error("Error connecting to Lanyard:", error);

            if (discordWidget) {
                discordWidget.innerHTML = `
                    <div class="activity-box">
                        <div class="activity-label">Signal</div>
                        <div class="activity-text">Unable to fetch live status.</div>
                    </div>
                `;
            }

            if (spotifyWidget) {
                spotifyWidget.innerHTML = `
                    <div class="widget-placeholder">Unable to fetch Spotify status.</div>
                `;
            }
        }
    }

    updateLanyardStatus();
    setInterval(updateLanyardStatus, 5000);
});
