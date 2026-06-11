document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('booking-modal');
    const bookBtn = document.getElementById('book-btn');
    const closeBtn = document.querySelector('.close-btn');
    const dateInput = document.getElementById('booking-date');
    const slotsContainer = document.getElementById('slots-container');
    const hiddenTimeInput = document.getElementById('booking-time');

    // Ish vaqtlari ro'yxati
    const workingHours = [
        "09:00", "10:00", "11:00", "12:00", "13:00", 
        "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
    ];

    // Sahifa pastidagi band vaqtlarni yig'ib olish
    function getBusyTimes() {
        const busyElements = document.querySelectorAll('.busy-list li');
        let busyTimes = [];
        busyElements.forEach(el => {
            let text = el.innerText.replace('(Band)', '').trim();
            busyTimes.push(text);
        });
        return busyTimes;
    }

    // Kun tanlanganda soat tugmachalarini generatsiya qilish
    if (dateInput) {
        dateInput.addEventListener('change', () => {
            const selectedDate = dateInput.value; // Format: YYYY-MM-DD
            slotsContainer.innerHTML = ''; // Eski tugmalarni tozalash
            hiddenTimeInput.value = ''; // Yashirin inputni tozalash
            
            const busyTimes = getBusyTimes();

            workingHours.forEach(hour => {
                const fullTimeToCheck = `${selectedDate} ${hour}`;
                
                // Yangi tugma yaratamiz
                const btn = document.createElement('div');
                btn.className = 'slot-btn';
                btn.innerText = hour;

                // Agar vaqt band bo'lsa, uni bloklaymiz
                if (busyTimes.includes(fullTimeToCheck)) {
                    btn.classList.add('disabled');
                } else {
                    // Bo'sh soat bo'lsa, bosish funksiyasini qo'shamiz
               btn.addEventListener('click', () => {
    document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    hiddenTimeInput.value = `${selectedDate}T${hour}`;
    // Yangi vizual tasdiq matni:
    document.getElementById('selected-time-text').innerText = `Tanlangan vaqt: ${selectedDate} soat ${hour}`;
});

                        
                        // Python (Backend) taniygan formatda yashirin inputga yozamiz (YYYY-MM-DDTHH:MM)
                        hiddenTimeInput.value = `${selectedDate}T${hour}`;
                        console.log("Tanlangan to'liq vaqt:", hiddenTimeInput.value);
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
        bookBtn.onclick = function() { 
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
