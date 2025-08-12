/* Common JavaScript for all slides in the AI presentation */

// Global navigation configuration
// Each slide should define its navigation paths
window.slideNavigation = window.slideNavigation || {
    previous: null,
    next: null
};

// Custom navigation handlers for slides with internal logic
window.slideCustomHandlers = window.slideCustomHandlers || {
    onNext: null,
    onPrevious: null
};

// Common keyboard navigation handler
document.addEventListener('DOMContentLoaded', function() {
    // Check if this slide should skip animations (coming from back navigation or revisiting)
    const urlParams = new URLSearchParams(window.location.search);
    const skipAnimations = urlParams.get('skipAnimations') === 'true';
    
    if (skipAnimations) {
        document.body.classList.add('no-animations');
        // Remove the parameter from URL without reloading
        const url = new URL(window.location);
        url.searchParams.delete('skipAnimations');
        window.history.replaceState({}, '', url);
    } else {
        // Only mark as visited if we're NOT skipping animations (i.e., first time visiting)
        markSlideAsVisited(window.location.pathname);
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            goToNext();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPrevious();
        } else if (e.key === '?') {
            e.preventDefault();
            toggleNotes();
        } else if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            resetSession();
        }
    });

    // Initialize common interactive elements if they exist
    initializeCommonInteractions();
});

// Navigation functions
function goToPrevious() {
    // Check if slide has custom previous handler
    if (window.slideCustomHandlers.onPrevious) {
        const result = window.slideCustomHandlers.onPrevious();
        // If custom handler returns false, it handled the navigation internally
        if (result === false) {
            return;
        }
    }
    
    // Default slide-to-slide navigation
    if (window.slideNavigation.previous) {
        // Add parameter to indicate this is backward navigation
        const previousUrl = window.slideNavigation.previous;
        const separator = previousUrl.includes('?') ? '&' : '?';
        const urlWithParam = previousUrl + separator + 'skipAnimations=true';
        window.location.href = urlWithParam;
    } else {
        // Fallback for slides that haven't been updated yet
        console.log('Previous navigation not configured for this slide');
    }
}

function goToNext() {
    // Check if slide has custom next handler
    if (window.slideCustomHandlers.onNext) {
        const result = window.slideCustomHandlers.onNext();
        // If custom handler returns false, it handled the navigation internally
        if (result === false) {
            return;
        }
    }
    
    // Default slide-to-slide navigation
    if (window.slideNavigation.next) {
        const nextUrl = window.slideNavigation.next;
        
        // Check if the target slide has been visited before
        if (hasSlideBeenVisited(getSlidePathFromUrl(nextUrl))) {
            // Add parameter to skip animations for revisited slides
            const separator = nextUrl.includes('?') ? '&' : '?';
            const urlWithParam = nextUrl + separator + 'skipAnimations=true';
            window.location.href = urlWithParam;
        } else {
            // First time visiting this slide, show animations
            window.location.href = nextUrl;
        }
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

// Toggle notes visibility
function toggleNotes() {
    const notesElement = document.getElementById('notes');
    if (notesElement) {
        const currentDisplay = window.getComputedStyle(notesElement).display;
        notesElement.style.display = (currentDisplay === 'none') ? 'block' : 'none';
    }
}

// Slide visit tracking functions
function markSlideAsVisited(slidePath) {
    try {
        const visitedSlides = getVisitedSlides();
        const normalizedPath = getSlidePathFromUrl(slidePath);
        if (!visitedSlides.includes(normalizedPath)) {
            visitedSlides.push(normalizedPath);
            sessionStorage.setItem('visitedSlides', JSON.stringify(visitedSlides));
        }
    } catch (e) {
        console.warn('Could not store visited slide:', e);
    }
}

function hasSlideBeenVisited(slidePath) {
    try {
        const visitedSlides = getVisitedSlides();
        const normalizedPath = getSlidePathFromUrl(slidePath);
        return visitedSlides.includes(normalizedPath);
    } catch (e) {
        console.warn('Could not check visited slides:', e);
        return false;
    }
}

function getVisitedSlides() {
    try {
        const stored = sessionStorage.getItem('visitedSlides');
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        console.warn('Could not retrieve visited slides:', e);
        return [];
    }
}

function getSlidePathFromUrl(url) {
    // Extract just the filename from relative or absolute URLs
    if (url.includes('/')) {
        return url.split('/').pop().split('?')[0];
    }
    return url.split('?')[0];
}

// Navigation setup functions
function setSlideNavigation(previousUrl, nextUrl) {
    window.slideNavigation = {
        previous: previousUrl,
        next: nextUrl
    };
    console.log('Slide navigation configured:', window.slideNavigation);
}

function setCustomNavigationHandlers(onNext, onPrevious) {
    window.slideCustomHandlers = {
        onNext: onNext,
        onPrevious: onPrevious
    };
    console.log('Custom navigation handlers set');
}

function clearCustomNavigationHandlers() {
    window.slideCustomHandlers = {
        onNext: null,
        onPrevious: null
    };
}

// Session reset function
function resetSession() {
    try {
        // Clear visited slides from session storage
        sessionStorage.removeItem('visitedSlides');
        
        // Remove no-animations class if present
        document.body.classList.remove('no-animations');
        
        // Reset current slide state if it has resetable elements
        resetCurrentSlideState();
        
        // Show confirmation message
        console.log('Session reset! All slide states cleared. Animations will now play on all slides.');
        
        // Optional: Show a brief visual confirmation
        const originalTitle = document.title;
        document.title = '✨ Session Reset';
        setTimeout(() => {
            document.title = originalTitle;
        }, 1500);
        
    } catch (e) {
        console.warn('Could not reset session:', e);
    }
}

// Reset the current slide's internal state
function resetCurrentSlideState() {
    // Reset workflow slide state if on that slide
    if (typeof currentStep !== 'undefined' && typeof totalSteps !== 'undefined') {
        // This is likely the workflow slide - reset it
        currentStep = -1;
        
        // Hide all workflow boxes
        const boxes = document.querySelectorAll('.workflow-box');
        boxes.forEach(box => {
            box.classList.remove('visible');
            box.style.transition = ''; // Restore transitions
        });
        
        console.log('Reset workflow slide state');
    }
    
    // Reset any other slide-specific states
    // Hide any elements that should be hidden initially
    const visibleElements = document.querySelectorAll('.visible');
    visibleElements.forEach(element => {
        // Only reset elements that look like they're part of progressive reveal
        if (element.classList.contains('workflow-box') || 
            element.classList.contains('refinement-card') ||
            element.classList.contains('step-card')) {
            element.classList.remove('visible');
            element.style.transition = ''; // Restore transitions
        }
    });
}