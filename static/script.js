document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('booking-modal');
    const bookBtn = document.getElementById('book-btn');
    const closeBtn = document.querySelector('.close-btn');
    const dateInput = document.getElementById('booking-date');
    const slotsContainer = document.getElementById('slots-container');
    const hiddenTimeInput = document.getElementById('booking-time');

    // Sartaroshxona ish vaqtlari (soatbay slotlar)
    const workingHours = [
        "09:00", "10:00", "11:00", "12:00", "13:00", 
        "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];

    // Sahifa pastidagi band vaqtlar ro'yxatidan ma'lumotlarni yig'ib olish
    function getBusyTimes() {
        const busyElements = document.querySelectorAll('.busy-list li');
        let busyTimes = [];
        busyElements.forEach(el => {
            // Matndan faqat vaqt qismini ajratib olish (Format: YYYY-MM-DD HH:MM)
            let text = el.innerText.replace('(Band)', '').trim();
            busyTimes.push(text);
        });
        return busyTimes;
    }

    // Soat tugmachalarini generatsiya qilish funksiyasi
    if (dateInput) {
        dateInput.addEventListener('change', () => {
            const selectedDate = dateInput.value; // YYYY-MM-DD
            slotsContainer.innerHTML = ''; // Oldingi tugmalarni tozalash
            hiddenTimeInput.value = ''; // Yashirin inputni tozalash
            
            const busyTimes = getBusyTimes();

            workingHours.forEach(hour => {
                const fullTimeToCheck = `${selectedDate} ${hour}`;
                const btn = document.createElement('div');
                btn.className = 'slot-btn';
                btn.innerText = hour;

                // Agar bu vaqt allaqachon band bo'lsa
                if (busyTimes.includes(fullTimeToCheck)) {
                    btn.classList.add('disabled');
                } else {
                    // Bo'sh bo'lsa, bosish hodisasini biriktiramiz
                    btn.addEventListener('click', () => {
                        // Oldingi tanlangan tugmadan 'selected' klassini olib tashlash
                        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
                        // Yangi tugmaga qo'shish
                        btn.classList.add('selected');
                        // Python-ga ketadigan to'liq vaqt formatini yashirin inputga yozish (YYYY-MM-DDTHH:MM)
                        hiddenTimeInput.value = `${selectedDate}T${hour}`;
                    });
                }
                slotsContainer.appendChild(btn);
            });
        });

        // Bugungi kundan oldingi kunlarni tanlab bo'lmaydigan qilish
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }

    // Modal oynani ochish va yopish mantiqi
    if (bookBtn && modal) {
        bookBtn.onclick = function() { modal.style.setProperty('display', 'block', 'important'); };
    }
    if (closeBtn && modal) {
        closeBtn.onclick = function() { modal.style.setProperty('display', 'none', 'important'); };
    }
    window.onclick = function(event) {
        if (event.target == modal) { modal.style.setProperty('display', 'none', 'important'); }
    };
});
