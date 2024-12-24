function toggleDropdown(id) {
    const dropdown = document.getElementById(id);
    if (dropdown.classList.contains('opacity-0')) {
        dropdown.classList.remove('opacity-0', 'scale-95');
        dropdown.classList.add('opacity-100', 'scale-100');
        dropdown.classList.remove('hidden'); // Ensure it's visible
    } else {
        dropdown.classList.add('opacity-0', 'scale-95');
        dropdown.classList.remove('opacity-100', 'scale-100');
        setTimeout(() => {
            dropdown.classList.add('hidden'); // Hide after animation
        }, 200); // Match the duration (200ms)
    }
}

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

function toggleDropdown(dropdownId) {
    // Close all other dropdowns
    const allDropdowns = document.querySelectorAll('.dropdown-content');
    allDropdowns.forEach(dropdown => {
        if (dropdown.id !== dropdownId) {
            dropdown.classList.add('hidden', 'opacity-0', 'scale-95');
            dropdown.classList.remove('opacity-100', 'scale-100');
        }
    });

    // Get the clicked dropdown
    const dropdown = document.getElementById(dropdownId);

    // Toggle classes for showing/hiding the dropdown
    if (dropdown.classList.contains('hidden')) {
        dropdown.classList.remove('hidden', 'opacity-0', 'scale-95');
        dropdown.classList.add('opacity-100', 'scale-100');
    } else {
        dropdown.classList.add('hidden', 'opacity-0', 'scale-95');
        dropdown.classList.remove('opacity-100', 'scale-100');
    }
}