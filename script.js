// Smooth fade-in effect on scroll
document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll('.section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    sections.forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });

    // A little console greeting for anyone inspecting your code 
    console.log("%cHello, Darling!", "color: #ff3366; font-size: 24px; font-weight: bold;");
});
