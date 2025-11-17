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
    });
});
 
// ** MEGA MENU DESKTOP STABILITY FIX **
// NOTE: For simple dropdowns, the CSS hover state is sufficient, but this JS adds extra stability.
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const dropdownContent = dropdown.querySelector('.dropdown-content');
    
    if (dropdownContent) {
        let timeout;

        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(timeout);
            if (window.innerWidth >= 992) {
                // Not strictly necessary due to CSS, but ensures it stays open
                // For Mega Menu logic, we'd use this. For simple dropdowns, CSS handles it.
            }
        });

        dropdown.addEventListener('mouseleave', () => {
            if (window.innerWidth >= 992) {
                // This JS prevents the menu from closing immediately if the mouse leaves for a second.
                timeout = setTimeout(() => {
                    // We don't need to manually hide it here because the CSS :hover state handles it.
                    // This is more for complex mega menus that might use JS to show/hide.
                }, 100); 
            }
        });
    }
});
