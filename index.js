/* Slide Index Configuration
 * Centralized navigation configuration for the AI presentation
 * Maintains the order and paths of all slides
 */

window.slideIndex = {
    slides: [
        {
            id: '01-intro',
            path: '01-intro.html'
        },
        {
            id: '02-tools',
            path: '02-tools.html'
        },
        {
            id: '03a-context',
            path: '03a-context.html'
        },
        {
            id: '03-custom-instructions-best-practices',
            path: '03-custom-instructions-best-practices.html'
        },
        {
            id: '04-custom-instructions',
            path: '04-custom-instructions.html'
        },
        {
            id: '04a-personas',
            path: '04a-personas.html'
        },
        {
            id: '01-refinement',
            path: '05-refinement.html'
        },
        {
            id: '02-refinement',
            path: '06-refinement.html'
        },
        {
            id: '04-coding',
            path: '07-coding.html'
        },
        {
            id: '04-coding-workflows',
            path: '08-coding-workflows.html'
        },
        {
            id: '06-review',
            path: '10-review.html'
        },
        {
            id: '07-debugging',
            path: '11-debugging.html'
        },
        {
            id: '12-demo',
            path: '12-demo.html'
        },
        {
            id: '08-questionnaire-feedback',
            path: '13-questionnaire-feedback.html'
        },
        {
            id: '10-final-thoughts',
            path: '14-final-thoughts.html'
        }
    ],

    // Get slide by index (0-based)
    getSlideByIndex: function (index) {
        return this.slides[index] || null;
    },

    // Get slide by ID
    getSlideById: function (id) {
        return this.slides.find(slide => slide.id === id) || null;
    },

    // Get slide index by ID
    getIndexById: function (id) {
        return this.slides.findIndex(slide => slide.id === id);
    },

    // Get slide index by path
    getIndexByPath: function (path) {
        // Normalize path to match stored paths
        const normalizedPath = path.replace(/^\.\.\//, '').replace(/^\//, '');
        return this.slides.findIndex(slide => slide.path === normalizedPath);
    },

    // Get current slide index based on current path
    getCurrentSlideIndex: function () {
        const currentPath = window.location.pathname;
        const filename = currentPath.split('/').pop();

        // Find slide by matching filename
        for (let i = 0; i < this.slides.length; i++) {
            if (this.slides[i].path.endsWith(filename)) {
                return i;
            }
        }
        return -1;
    },

    // Get previous slide path
    getPreviousSlide: function (currentIndex = null) {
        if (currentIndex === null) {
            currentIndex = this.getCurrentSlideIndex();
        }

        if (currentIndex > 0) {
            return this.slides[currentIndex - 1].path;
        }
        return null;
    },

    // Get next slide path
    getNextSlide: function (currentIndex = null) {
        if (currentIndex === null) {
            currentIndex = this.getCurrentSlideIndex();
        }

        if (currentIndex >= 0 && currentIndex < this.slides.length - 1) {
            return this.slides[currentIndex + 1].path;
        }
        return null;
    },

    // Auto-configure navigation for current slide
    autoConfigureNavigation: function () {
        const currentIndex = this.getCurrentSlideIndex();
        if (currentIndex >= 0) {
            const previousPath = this.getPreviousSlide(currentIndex);
            const nextPath = this.getNextSlide(currentIndex);

            // Use the existing setSlideNavigation function from main.js
            if (typeof setSlideNavigation === 'function') {
                setSlideNavigation(previousPath, nextPath);
            }

            return {
                previous: previousPath,
                next: nextPath,
                current: this.slides[currentIndex]
            };
        }
        return null;
    },

    // Get all slide information for debugging
    getAllSlides: function () {
        return this.slides.map((slide, index) => ({
            index: index,
            ...slide
        }));
    }
};

