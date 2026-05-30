// Funcionalidades Interactivas para la Página Ciber-Piloto Zero

document.addEventListener("DOMContentLoaded", () => {
    // --- Scroll Suave para la Navegación ---
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

    // --- Efecto de Aparición de Tarjetas al Hacer Scroll ---
    const cyberCards = document.querySelectorAll('.cyber-card, .gallery-item');
    
    const observeOptions = {
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: "0px 0px -50px 0px" // Slight offset
    };

    const cardObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = entry.target.classList.contains('cyber-card') ? 'translateY(0)' : 'scale(1)';
                entry.target.style.transition = 'all 0.6s ease-out';
                cardObserver.unobserve(entry.target); // Only animate once
            }
        });
    }, observeOptions);

    cyberCards.forEach(card => {
        // Estado inicial para la aparición
        card.style.opacity = 0;
        card.style.transform = card.classList.contains('cyber-card') ? 'translateY(30px)' : 'scale(0.9)';
        cardObserver.observe(card);
    });

    // Saludo de consola (para ciber-especialistas que inspeccionen)
    console.log("%cConexión Establecida. Estado del Piloto 002: ACTIVO.", "color: #ff3366; font-size: 20px; font-weight: bold;");
});
