from flask import Flask, render_template, request, redirect, url_for, flash
import json
import requests
import os

app = Flask(__name__)
app.secret_key = "sartarosh_maxfiy_kaliti" # Xatolik xabarlarini (flash) ko'rsatish uchun kerak

# --- TELEGRAM SOZLAMALARI ---
BOT_TOKEN = "8886573327:AAE1RBqpKU_6l86GeFAQzXPZyTnlrAotDwc" # O'zingizning tokenni qo'ying
CHAT_ID = "5829769562" # O'zingizning IDingizni qo'ying

# Navigatsiya menyusini o'qish
def load_navbar():
    try:
        with open('navbarlar.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

# Navbatlarni JSON fayldan yuklash
def load_appointments():
    if not os.path.exists('navbatlar_baza.json'):
        return []
    try:
        with open('navbatlar_baza.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except:
        return []

# Yangi navbatni saqlash
def save_appointment(new_app):
    appointments = load_appointments()
    appointments.append(new_app)
    with open('navbatlar_baza.json', 'w', encoding='utf-8') as f:
        json.dump(appointments, f, ensure_ascii=False, indent=4)

@app.route('/')
def home():
    nav_items = load_navbar()
    appointments = load_appointments() # Hamma navbatlarni yuklaymiz
    
    # Vaqtlarni mijozga chiroyli formatda (masalan: 2026-06-01 22:00) ko'rsatish uchun ro'yxat tuzamiz
    busy_times = []
    for app_item in appointments:
        # 'T' harfini o'chirib, chiroyli vaqt formatiga keltiramiz
        formatted_time = app_item['time'].replace('T', ' ')
        busy_times.append(formatted_time)
        
    return render_template('index.html', navbar=nav_items, busy_times=busy_times)

def book_appointment():
    name = request.form.get('name')
    phone = request.form.get('phone')
    service = request.form.get('service')
    time = request.form.get('time') # Format: '2026-06-01T22:00'
    
    # --- VAQTNI TEKSHIRISH (ENG MUHIM JOYI) ---
    existing_appointments = load_appointments()
    for app_item in existing_appointments:
        if app_item['time'] == time:
            # Agar bu vaqt bazada allaqachon bo'lsa, xabar beramiz va to'xtatamiz
            flash("Kechirasiz, siz tanlagan vaqt allaqachon band! Iltimos, boshqa vaqtni tanlang.", "error")
            return redirect(url_for('home'))
            
    # Agar vaqt bo'sh bo'lsa, davom etamiz
    new_booking = {
        "name": name,
        "phone": phone,
        "service": service,
        "time": time
    }
    save_appointment(new_booking)
        
    # Telegram bot xabari
    telegram_msg = (
        "YANGI NAVBAT PAYDO BO'LDI!\n\n"
        f"Mijoz: {name}\n"
        f"Telefon: {phone}\n"
        f"Xizmat: {service}\n"
        f"Vaqt: {time.replace('T', ' ')}"
    )
    
    url = f"https://telegram.org{BOT_TOKEN}/sendMessage"
    payload = {"chat_id": CHAT_ID, "text": telegram_msg}
    
    try:
        requests.post(url, json=payload)
        flash("Arizangiz muvaffaqiyatli yuborildi! Tez orada aloqaga chiqamiz.", "success")
    except Exception as e:
        print("Telegram xatoligi:", e)
        
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
