document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('booking-modal');
    const bookBtn = document.getElementById('book-btn');
    const closeBtn = document.querySelector('.close-btn');

    if (bookBtn && modal) {
        bookBtn.onclick = function() {
            // display: block qilishni majburiy usulda o'rnatamiz
            modal.style.setProperty('display', 'block', 'important');
        };
    }

    if (closeBtn && modal) {
        closeBtn.onclick = function() {
            modal.style.setProperty('display', 'none', 'important');
        };
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.setProperty('display', 'none', 'important');
        }
    };
});
