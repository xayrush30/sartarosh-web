document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('booking-modal');
    const bookBtn = document.getElementById('book-btn');
    const closeBtn = document.querySelector('.close-btn');
    const dateInput = document.getElementById('booking-date');
    const barberSelect = document.getElementById('barber-select');
    const slotsContainer = document.getElementById('slots-container');
    const hiddenTimeInput = document.getElementById('booking-time');
    const timeText = document.getElementById('selected-time-text');
    const bookingForm = document.getElementById('booking-form');

    const workingHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

    function getBusySlots() {
        const busyElements = document.querySelectorAll('.busy-list li');
        let busyList = [];
        busyElements.forEach(el => {
            let cleanText = el.innerText.replace('(Band)', '').trim();
            let parts = cleanText.split(' - ');
            if (parts.length === 2) {
                busyList.push({ barber: parts[0].trim(), datetime: parts[1].trim() });
            }
        });
        return busyList;
    }

    function generateTimeSlots() {
        if (!dateInput.value || !barberSelect.value) {
            slotsContainer.innerHTML = '<p style="color: #aaa; font-size:13px; grid-column: span 4; text-align:center;">Iltimos, oldin usta va kunni tanlang.</p>';
            return;
        }

        const selectedDate = dateInput.value;
        const selectedBarber = barberSelect.value;
        slotsContainer.innerHTML = '';
        hiddenTimeInput.value = '';
        if (timeText) timeText.innerText = '';

        const busySlots = getBusySlots();
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const currentDateString = `${year}-${month}-${day}`;
        
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        workingHours.forEach(hourStr => {
            const fullTimeToCheck = `${selectedDate} ${hourStr}`;
            const [h, m] = hourStr.split(':').map(Number);

            const btn = document.createElement('div');
            btn.className = 'slot-btn';
            btn.innerText = hourStr;

            const isReserved = busySlots.some(slot => slot.barber === selectedBarber && slot.datetime === fullTimeToCheck);

            let isPastTime = false;
            if (selectedDate === currentDateString) {
                if (h < currentHour || (h === currentHour && m <= currentMinute)) {
                    isPastTime = true;
                }
            }

            if (isReserved || isPastTime) {
                btn.classList.add('disabled');
            } else {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    hiddenTimeInput.value = `${selectedDate}T${hourStr}`;
                    if (timeText) {
                        timeText.innerText = `Tanlandi: ${selectedBarber}, Soat: ${hourStr}`;
                    }
                });
            }
            slotsContainer.appendChild(btn);
        });
    }

    if (dateInput) dateInput.addEventListener('change', generateTimeSlots);
    if (barberSelect) barberSelect.addEventListener('change', generateTimeSlots);

    if (dateInput) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        dateInput.setAttribute('min', `${year}-${month}-${day}`);
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            if (!hiddenTimeInput.value) {
                e.preventDefault();
                alert('Iltimos, navbat soatini tanlang!');
            }
        });
    }

    if (bookBtn && modal) {
        bookBtn.onclick = function() { 
            modal.style.display = 'block'; 
            generateTimeSlots(); 
        };
    }
    if (closeBtn && modal) {
        closeBtn.onclick = function() { modal.style.display = 'none'; };
    }
    window.onclick = function(event) {
        if (event.target == modal) { modal.style.display = 'none'; }
    };
});