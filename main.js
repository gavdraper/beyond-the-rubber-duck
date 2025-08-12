/* Common JavaScript for all slides in the AI presentation */

// Global navigation configuration
// Each slide should define its navigation paths
window.slideNavigation = window.slideNavigation || {
    previous: null,
    next: null
};

// Common keyboard navigation handler
document.addEventListener('DOMContentLoaded', function() {
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goToNext();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrevious();
        }
    });

    // Initialize common interactive elements if they exist
    initializeCommonInteractions();
});

// Navigation functions
function goToPrevious() {
    if (window.slideNavigation.previous) {
        window.location.href = window.slideNavigation.previous;
    } else {
        // Fallback for slides that haven't been updated yet
        console.log('Previous navigation not configured for this slide');
    }
}

function goToNext() {
    if (window.slideNavigation.next) {
        window.location.href = window.slideNavigation.next;
    } else {
        // Fallback for slides that haven't been updated yet
        console.log('Next navigation not configured for this slide');
    }
}

// Common interactive element initialization
function initializeCommonInteractions() {
    // Timeline cards hover effects (for intro slide)
    const timelineCards = document.querySelectorAll('.timeline-card');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    
    timelineCards.forEach((card) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-3px)';
        });
    });

    stepIndicators.forEach((indicator) => {
        indicator.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(-50%) scale(1.1)';
        });
        
        indicator.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(-50%) scale(1)';
        });
    });

    // Tool cards hover effects (for tools slide)
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach((card) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Quality boxes hover effects (for coding slides)
    const qualityBoxes = document.querySelectorAll('.quality-box');
    
    qualityBoxes.forEach((box) => {
        box.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        box.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Demo cards hover effects (for various slides)
    const demoCards = document.querySelectorAll('.demo-card, .step-card, .feature-card');
    
    demoCards.forEach((card) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Utility function for smooth scrolling (if needed)
function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Debug function to help with navigation setup
function setSlideNavigation(previousUrl, nextUrl) {
    window.slideNavigation = {
        previous: previousUrl,
        next: nextUrl
    };
    console.log('Slide navigation configured:', window.slideNavigation);
}