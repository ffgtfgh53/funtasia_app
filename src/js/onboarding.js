import Alpine from 'alpinejs';
import swipeIcon from "@/misc/single-finger-click.svg";

window.Alpine = Alpine;

// Canonical Alpine v3 component registration
Alpine.data('onboarding', () => ({
    current: 0,
    total: 6,
    dragging: false,
    startX: 0,
    dragX: 0,
    pointerId: null,
    showHint: true,

    init() {
        // Load the image source dynamically through Vite ES module
        const hintImg = document.getElementById('swipe-hint-img');
        if (hintImg) hintImg.src = swipeIcon;
    },

    isFinal() {
        return this.current === this.total - 1;
    },

    goTo(url) {
        window.location.href = url;
    },

    next() {
        if (this.current === 0) {
            this.showHint = false;
        }
        if (this.current < this.total - 1) this.current++;
    },

    prev() {
        if (this.current > 0) this.current--;
    },

    onTouchStart(e) {
        this.dragging = true;
        this.startX = e.touches[0].clientX;
        this.dragX = 0;
    },

    onTouchMove(e) {
        if (!this.dragging) return;
        const dx = e.touches[0].clientX - this.startX;
        if (this.current === 0) {
            // First card: no right swipe
            this.dragX = Math.min(dx, 0);
        } else if (this.isFinal()) {
            // Final card: no left swipe
            this.dragX = Math.max(dx, 0);
        } else {
            this.dragX = dx;
        }
    },

    onTouchEnd(e) {
        if (!this.dragging) return;
        this.dragging = false;
        const threshold = this.$refs.viewport.clientWidth * 0.20;
        if (this.dragX < -threshold) {
            this.next();
        } else if (this.dragX > threshold) {
            this.prev();
        }
        this.dragX = 0;
    },

    onMouseDown(e) {
        this.dragging = true;
        this.startX = e.clientX;
        this.dragX = 0;
        e.currentTarget.style.cursor = 'grabbing';
    },

    onMouseMove(e) {
        if (!this.dragging) return;
        const dx = e.clientX - this.startX;
        if (this.current === 0) {
            this.dragX = Math.min(dx, 0);
        } else if (this.isFinal()) {
            this.dragX = Math.max(dx, 0);
        } else {
            this.dragX = dx;
        }
    },

    onMouseUp(e) {
        if (!this.dragging) return;
        this.dragging = false;
        this.$refs.viewport.style.cursor = 'grab';
        const threshold = this.$refs.viewport.clientWidth * 0.20;
        if (this.dragX < -threshold) {
            this.next();
        } else if (this.dragX > threshold) {
            this.prev();
        }
        this.dragX = 0;
    }
}));

Alpine.start();
