window.addEventListener("load", () => {
    const loader = document.querySelector(".loader");
  
    loader.classList.add("loader--hidden");
  
    loader.addEventListener("transitionend", () => {
      document.body.removeChild(loader);
    });
  });
  

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
});

document.getElementById("close-banner").addEventListener("click", function (event) {
    event.stopPropagation();  // Prevent clicking on the button itself from triggering the close event
    this.closest("button").style.display = "none";  // Hide the button (banner)
  });