// JS for Hamburger Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Optional: Close menu when a link is clicked (for mobile)
// This excludes dropdown buttons and links inside dropdowns for proper navigation
navLinks.querySelectorAll('.nav-links > a, .dropdown-content a').forEach(link => {
    link.addEventListener('click', () => {
        // Only close if it's a direct link or a link inside a dropdown on mobile
        if (window.innerWidth <= 991) {
            // Delay closing slightly to allow navigation
             setTimeout(() => {
                navLinks.classList.remove('active');
            }, 100);
        }
    });
});

// JS for Dropdown toggles on Mobile (Handles both simple and mega menus)
navLinks.querySelectorAll('.dropdown > .dropbtn').forEach(dropbtn => {
    dropbtn.addEventListener('click', function(e) {
        if (window.innerWidth <= 991) {
            e.preventDefault(); 
            const dropdown = this.parentElement;
            
            // Close all other dropdowns
            document.querySelectorAll('.dropdown.show').forEach(openDropdown => {
                if (openDropdown !== dropdown) {
                    openDropdown.classList.remove('show');
                }
            });
            // Toggle the clicked dropdown
            dropdown.classList.toggle('show');
        }
        // Fix: Prevent default action on desktop click, but allow CSS hover to take over
        if (window.innerWidth >= 992) {
             e.preventDefault(); 
        }
    });
});

// NOTE: The previous MEGA MENU DESKTOP STABILITY FIX block has been removed!
// Reason: CSS :hover handles desktop dropdown stability much better without JS conflicts.
// The code is now cleaner and more stable.
