from flask import Flask, render_template, request, redirect, url_for
import json
import requests

app = Flask(__name__)

# --- TELEGRAM SOZLAMALARI ---
BOT_TOKEN = "8886573327:AAE1RBqpKU_6l86GeFAQzXPZyTnlrAotDwc"
CHAT_ID = "5829769562"

# Navigatsiya menyusi uchun JSON ma'lumotlarini o'qish
def load_navbar():
    try:
        with open('navbarlar.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@app.route('/')
def home():
    nav_items = load_navbar()
    return render_template('index.html', navbar=nav_items)
# Mijoz yuborgan ariza (navbat) ma'lumotlarini qabul qilish
@app.route('/book', methods=['POST'])
def book_appointment():
    name = request.form.get('name')
    phone = request.form.get('phone')
    service = request.form.get('service')
    time = request.form.get('time')
    
    # 1. Ma'lumotlarni faylga yozish
    appointment_data = f"Mijoz: {name} | Tel: {phone} | Xizmat:{service}|Vaqt: {time}\n"
    with open('navbatlar.txt', 'a', encoding='utf-8') as f:
        f.write(appointment_data)
        
    # 2. Telegram bot orqali xabar yuborish (Xavfsiz HTML formatida)
    telegram_msg = (
        "YANGI NAVBAT PAYDO BO'LDI!\n\n"
        f"Mijoz: {name}\n"
        f"Telefon: {phone}\n"
        f"Xizmat: {service}\n"
        f"Vaqt: {time}"
    )
    
    
    # Telegram API-ga so'rov yuborish
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": CHAT_ID,
        "text": telegram_msg,
        "parse_mode": "HTML" # Markdown o'rniga HTML ishlatamiz
    }
    
    try:
        response = requests.post(url, json=payload)
        # Terminalda Telegram javobini tekshirish uchun:
        print("Telegram API javobi:", response.status_code, response.text)
    except Exception as e:
        print("Telegramga yuborishda ulanish xatoligi:", e)
        
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run(debug=True)
