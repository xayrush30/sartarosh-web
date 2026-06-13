from flask import Flask, render_template, request, redirect, url_for, flash, session
import sqlite3
import os

base_dir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__, 
            template_folder=os.path.join(base_dir, 'templates'),
            static_folder=os.path.join(base_dir, 'static'))

app.secret_key = "sartarosh_juda_maxfiy_kaliti_12345"
app.config['SESSION_COOKIE_NAME'] = 'sartarosh_session'

DB_PATH = os.path.join(base_dir, 'navbatlar_baza.db')

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "123"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT barber FROM appointments LIMIT 1')
    except sqlite3.OperationalError:
        cursor.execute('DROP TABLE IF EXISTS appointments')
        conn.commit()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            service TEXT NOT NULL,
            barber TEXT NOT NULL,
            time TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/')
def home():
    nav_items = [
        {"name": "Bosh sahifa", "link": "#home"},
        {"name": "Xizmatlar", "link": "#services"},
        {"name": "Narxlar", "link": "#prices"},
        {"name": "Tavsiyalar", "link": "#recommendations"}, # Yangi menyu
        {"name": "Band vaqtlari", "link": "#busy-schedule"},
        {"name": "Aloqa", "link": "#contact"}
    ]
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT barber, time FROM appointments')
    rows = cursor.fetchall()
    conn.close()
    
    busy_times = [f"{row[0]} - {row[1].replace('T', ' ')}" for row in rows]
    return render_template('index.html', navbar=nav_items, busy_times=busy_times)

@app.route('/book', methods=['POST'])
def book_appointment():
    name = request.form.get('name')
    phone = request.form.get('phone')
    service = request.form.get('service')
    barber = request.form.get('barber')
    time = request.form.get('time')
    
    if not time or not barber:
        flash("Iltimos, usta va soatni to'liq tanlang!", "error")
        return redirect(url_for('home'))
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM appointments WHERE time = ? AND barber = ?', (time, barber))
    exists = cursor.fetchone()
    
    if exists:
        conn.close()
        flash(f"Kechirasiz, usta {barber}ning bu vaqti allaqachon band!", "error")
        return redirect(url_for('home'))
        
    cursor.execute('INSERT INTO appointments (name, phone, service, barber, time) VALUES (?, ?, ?, ?, ?)',
                   (name, phone, service, barber, time))
    conn.commit()
    conn.close()
    
    flash("Arizangiz muvaffaqiyatli qabul qilindi!", "success")
    return redirect(url_for('home'))

@app.route('/admin-login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session.clear()
            session['admin_logged_in'] = "ha"
            return redirect(url_for('admin_panel'))
        else:
            flash("Login yoki parol noto'g'ri!", "error")
    return render_template('login.html')

@app.route('/admin-panel')
def admin_panel():
    if session.get('admin_logged_in') != "ha":
        return redirect(url_for('admin_login'))
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, phone, service, barber, time FROM appointments ORDER BY time ASC')
    rows = cursor.fetchall()
    conn.close()
    appointments_list = []
    for row in rows:
        appointments_list.append({'id': row[0], 'name': row[1], 'phone': row[2], 'service': row[3], 'barber': row[4], 'time': row[5].replace('T', ' ')})
    return render_template('admin.html', appointments=appointments_list)

@app.route('/delete-appointment/<int:id>')
def delete_appointment(id):
    if session.get('admin_logged_in') != "ha":
        return redirect(url_for('admin_login'))
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM appointments WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return redirect(url_for('admin_panel'))

@app.route('/admin-logout')
def admin_logout():
    session.clear()
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
