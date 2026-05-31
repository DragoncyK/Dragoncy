document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const progress = document.getElementById("scrollLine");
  const revealItems = document.querySelectorAll(".reveal");
  const navLinks = document.querySelectorAll(".hero-nav a");

  function updateProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progress.style.width = `${Math.min(100, Math.max(0, ratio))}%`;
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

  revealItems.forEach((item) => io.observe(item));

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  window.addEventListener("pointermove", (e) => {
    const x = ((e.clientX / window.innerWidth) - 0.5) * 16;
    const y = ((e.clientY / window.innerHeight) - 0.5) * 16;
    root.style.setProperty("--mx", `${x.toFixed(2)}px`);
    root.style.setProperty("--my", `${y.toFixed(2)}px`);
  }, { passive: true });

  const lanyardAPI = "https://api.lanyard.rest/v1/users/738501782413639790";
  const spotifyWidget = document.getElementById("spotify-widget-content");
  const discordWidget = document.getElementById("discord-widget-content");

  const statusColors = {
    online: "#46e58f",
    idle: "#ffc96a",
    dnd: "#ff5b7e",
    offline: "#8a93ff"
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

      const discordStatus = data.discord_status || "offline";
      const currentColor = statusColors[discordStatus] || statusColors.offline;
      const activities = Array.isArray(data.activities) ? data.activities : [];
      const gameActivity = activities.find((act) => act.id !== "spotify:1" && act.name);

      let discordHTML = `
        <div class="status-layout">
          <div class="status-dot" style="background:${currentColor}; color:${currentColor};"></div>
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
            </div>
          </div>
        `;
      } else {
        spotifyWidget.innerHTML = `
          <div class="widget-fallback">
            <div class="orb orb-green"></div>
            <div class="widget-text">
              <p class="widget-title">No track playing</p>
              <p class="widget-sub">Start a song and it will show here.</p>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error("Error connecting to Lanyard:", error);

      if (discordWidget) {
        discordWidget.innerHTML = `
          <div class="widget-fallback">
            <div class="orb orb-blue"></div>
            <div class="widget-text">
              <p class="widget-title">Signal unavailable</p>
              <p class="widget-sub">Live status could not be fetched just now.</p>
            </div>
          </div>
        `;
      }

      if (spotifyWidget) {
        spotifyWidget.innerHTML = `
          <div class="widget-fallback">
            <div class="orb orb-green"></div>
            <div class="widget-text">
              <p class="widget-title">No track playing</p>
            </div>
          </div>
        `;
      }
    }
  }

  updateLanyardStatus();
  setInterval(updateLanyardStatus, 5000);
});
