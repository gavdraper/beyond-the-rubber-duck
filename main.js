/* Common JavaScript for all slides in the AI presentation */

// Global navigation configuration
// Each slide should define its navigation paths
window.slideNavigation = window.slideNavigation || {
    previous: null,
    next: null
};

// Progressive Reveal Framework
window.progressiveReveal = window.progressiveReveal || {
    currentStep: 0,
    totalSteps: 0,
    enabled: false
};

// Custom navigation handlers for slides with internal logic
window.slideCustomHandlers = window.slideCustomHandlers || {
    onNext: null,
    onPrevious: null
};

// Common keyboard navigation handler
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const skipAnimations = urlParams.get('skipAnimations') === 'true';
    if (skipAnimations) {
        document.body.classList.add('no-animations');
        const url = new URL(window.location);
        url.searchParams.delete('skipAnimations');
        window.history.replaceState({}, '', url);
    } else {
        markSlideAsVisited(window.location.pathname);
    }

    // Try to auto-configure navigation from slide index
    // This will be overridden by any manual setSlideNavigation calls
    setTimeout(() => {
        if (!window.slideNavigation || (!window.slideNavigation.previous && !window.slideNavigation.next)) {
            autoConfigureSlideNavigation();
        }
    }, 50);

    // Auto-enable progressive reveal if slide has reveal elements
    const revealElements = document.querySelectorAll('[class*="reveal-on-next-"]');
    if (revealElements.length > 0) {
        enableProgressiveReveal();
    }

    // Initialize progressive reveal if enabled
    initializeProgressiveReveal();

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
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

// Progressive Reveal Framework Functions
function enableProgressiveReveal() {
    window.progressiveReveal.enabled = true;

    // Count total reveal steps
    const revealElements = document.querySelectorAll('[class*="reveal-on-next-"]');
    let maxStep = 0;
    revealElements.forEach(element => {
        const classes = element.className.split(' ');
        classes.forEach(cls => {
            const match = cls.match(/reveal-on-next-(\d+)/);
            if (match) {
                maxStep = Math.max(maxStep, parseInt(match[1]));
            }
        });
    });

    window.progressiveReveal.totalSteps = maxStep;
    window.progressiveReveal.currentStep = 0;

    // Set up custom navigation
    setCustomNavigationHandlers(
        function () { // onNext
            if (window.progressiveReveal.currentStep < window.progressiveReveal.totalSteps) {
                window.progressiveReveal.currentStep++;
                revealNextStep();
                return false; // Handle internally
            }
            return true; // Proceed to next slide
        },
        function () { // onPrevious
            return true; // Always go to previous slide
        }
    );
}

function initializeProgressiveReveal() {
    if (!window.progressiveReveal.enabled) return;

    const hasNoAnimations = document.body.classList.contains('no-animations');

    if (hasNoAnimations) {
        // Show all reveal elements immediately
        const allRevealElements = document.querySelectorAll('[class*="reveal-on-"]');
        allRevealElements.forEach(element => {
            element.style.transition = 'none';
            element.classList.add('reveal-visible');
        });
        window.progressiveReveal.currentStep = window.progressiveReveal.totalSteps;
    } else {
        // Normal initialization - elements are already hidden by CSS
        // reveal-on-load elements are shown by CSS
    }
}

function revealNextStep() {
    const elementsToReveal = document.querySelectorAll(`.reveal-on-next-${window.progressiveReveal.currentStep}`);
    elementsToReveal.forEach(element => {
        element.classList.add('reveal-visible');
    });
}

function resetProgressiveReveal() {
    if (!window.progressiveReveal.enabled) return;

    // Reset step counter
    window.progressiveReveal.currentStep = 0;

    // Hide all reveal elements except reveal-on-load
    const allRevealElements = document.querySelectorAll('[class*="reveal-on-next-"]');
    allRevealElements.forEach(element => {
        element.classList.remove('reveal-visible');
        element.style.transition = ''; // Restore transitions
    });
}

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
        // No next slide configured - this is likely the final slide
        console.log('No next slide available - this appears to be the final slide');
        
        // Hide or disable the next button if it exists
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn && !nextBtn.classList.contains('disabled')) {
            nextBtn.innerHTML = 'End<span>🎉</span>';
            nextBtn.classList.add('disabled');
            nextBtn.style.pointerEvents = 'none';
            nextBtn.style.opacity = '0.5';
            nextBtn.style.cursor = 'not-allowed';
        }
    }
}

// Common interactive element initialization
function initializeCommonInteractions() {
    // Standardized hover effects configuration
    const hoverConfigs = [
        {
            selectors: ['.timeline-card'],
            enter: 'translateY(-8px)',
            leave: 'translateY(-3px)'
        },
        {
            selectors: ['.step-indicator'],
            enter: 'translateX(-50%) scale(1.1)',
            leave: 'translateX(-50%) scale(1)'
        },
        {
            selectors: ['.tool-card', '.quality-box'],
            enter: 'translateY(-8px) scale(1.02)',
            leave: 'translateY(0) scale(1)'
        },
        {
            selectors: ['.demo-card', '.step-card', '.feature-card'],
            enter: 'translateY(-5px)',
            leave: 'translateY(0)'
        },
        {
            selectors: ['.refinement-card'],
            enter: 'translateY(-8px)',
            leave: 'translateY(-5px)'
        }
    ];

    // Apply standardized hover effects
    hoverConfigs.forEach(config => {
        config.selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                element.addEventListener('mouseenter', function () {
                    this.style.transform = config.enter;
                });
                element.addEventListener('mouseleave', function () {
                    this.style.transform = config.leave;
                });
            });
        });
    });

    // Special case: Story cards with shadow effects
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach((card) => {
        card.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-5px) scale(1.02)';
            this.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
        });
    });

    // Click animation for benefit items
    const benefitItems = document.querySelectorAll('.benefit-item');
    benefitItems.forEach(item => {
        item.addEventListener('click', function () {
            this.style.transform = 'scale(0.95)';
            this.style.background = 'rgba(255, 255, 255, 0.4)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
                this.style.background = 'rgba(255, 255, 255, 0.2)';
            }, 150);
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

// Auto-configure navigation using slide index if available
function autoConfigureSlideNavigation() {
    if (window.slideIndex && typeof window.slideIndex.autoConfigureNavigation === 'function') {
        const navConfig = window.slideIndex.autoConfigureNavigation();
        if (navConfig) {
            console.log('Navigation auto-configured from index:', navConfig);
            return true;
        }
    }
    return false;
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
    // Reset progressive reveal framework
    resetProgressiveReveal();

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