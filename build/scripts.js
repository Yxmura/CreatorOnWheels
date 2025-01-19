// Ensure the script runs after the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const lightSwitch = document.getElementById('lightSwitch');

    // Apply saved theme from localStorage
    if (localStorage.getItem('dark-mode') === 'true') {
        document.documentElement.classList.add('dark');
        lightSwitch.checked = true;
    } else {
        document.documentElement.classList.remove('dark');
    }

    // Add event listener for theme toggling
    lightSwitch.addEventListener('change', () => {
        const isDark = lightSwitch.checked;
        document.documentElement.classList.toggle('dark', isDark);
        localStorage.setItem('dark-mode', isDark);
    });
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    const resourcesBtn = document.getElementById('mobile-resources-btn');
    const toolsBtn = document.getElementById('mobile-tools-btn');
    const resourcesDropdown = document.getElementById('mobile-resources-dropdown');
    const toolsDropdown = document.getElementById('mobile-tools-dropdown');

    menuToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('hidden');
    });

    resourcesBtn.addEventListener('click', () => {
        resourcesDropdown.classList.toggle('hidden');
        resourcesBtn.querySelector('svg').classList.toggle('rotate-180');
    });

    toolsBtn.addEventListener('click', () => {
        toolsDropdown.classList.toggle('hidden');
        toolsBtn.querySelector('svg').classList.toggle('rotate-180');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target)) {
            mobileNav.classList.add('hidden');
        }
    });
});

document.getElementById("close-banner").addEventListener("click", function (event) {
    event.stopPropagation();  // Prevent clicking on the button itself from triggering the close event
    this.closest("button").style.display = "none";  // Hide the button (banner)
  });