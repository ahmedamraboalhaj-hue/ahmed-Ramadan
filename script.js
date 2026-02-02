// Reveal on Scroll Animations
const revealElements = document.querySelectorAll('.feature-card, .course-card');

const revealOnScroll = () => {
    for (let i = 0; i < revealElements.length; i++) {
        const windowHeight = window.innerHeight;
        const revealTop = revealElements[i].getBoundingClientRect().top;
        const revealPoint = 150;

        if (revealTop < windowHeight - revealPoint) {
            revealElements[i].style.opacity = '1';
            revealElements[i].style.transform = 'translateY(0)';
        }
    }
};

window.addEventListener('scroll', revealOnScroll);

// Initialize some styles for reveal animation
revealElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease-out';
});

// Animation initial call
revealOnScroll();

// Admin Login via Prompt
function openAdmin() {
    const password = prompt("برجاء إدخال كلمة المرور للدخول للوحة التحكم:");
    if (password === "010qwe") {
        window.location.href = 'admin.html';
    } else if (password !== null) {
        alert("كلمة المرور غير صحيحة!");
    }
}

// --- Firebase Configuration (REQUIRED) ---
// Note: This must match the config in admin.html
const firebaseConfig = {
    apiKey: "AIzaSyDGKHCYjB-ryi6To5lDwlYya6hFOS4i40E",
    authDomain: "ahlquraan-29c5b.firebaseapp.com",
    projectId: "ahlquraan-29c5b",
    storageBucket: "ahlquraan-29c5b.firebasestorage.app",
    messagingSenderId: "677127394598",
    appId: "1:677127394598:web:a237d013ad2174f1e95de7",
    measurementId: "G-033RNWBVTL"
};

// Initialize Firebase (Check if already initialized to avoid errors)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Student Dashboard Dynamic Content (Live from Firebase)
document.addEventListener('DOMContentLoaded', () => {
    // Check if on dashboard
    const lessonCard = document.querySelector('.next-lesson-card');
    if (lessonCard) {

        // Listen for Latest Lecture
        db.collection('platform_data').doc('latestLecture').onSnapshot((doc) => {
            if (doc.exists) {
                const lecture = doc.data();
                lessonCard.innerHTML = `
                    <h2>المحاضرة المضافة حديثاً</h2>
                    <p style="font-size: 1.4rem; margin-bottom: 20px;">${lecture.title}</p>
                    <div class="video-container" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 15px; background: #000; margin-bottom: 20px;">
                        <iframe 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
                            src="https://www.youtube.com/embed/${lecture.videoId}?modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowfullscreen>
                        </iframe>
                        <div style="position: absolute; bottom: 0; right: 0; width: 150px; height: 50px; background: transparent; z-index: 10; cursor: default;"></div>
                    </div>
                    <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px;">${lecture.desc}</p>
                    <div class="lesson-info">
                        <span class="info-pill"><i class="far fa-calendar"></i> ${lecture.date}</span>
                    </div>
                `;
            }
        });

        // Listen for Latest Quiz
        db.collection('platform_data').doc('latestQuiz').onSnapshot((doc) => {
            if (doc.exists) {
                const quiz = doc.data();
                const announcements = document.querySelector('.announcements');

                // Clear old quiz alerts if any
                const oldQuizAlert = document.getElementById('live-quiz-alert');
                if (oldQuizAlert) oldQuizAlert.remove();

                const newAlert = document.createElement('div');
                newAlert.id = 'live-quiz-alert';
                newAlert.className = 'announcement-item';
                newAlert.style.background = 'rgba(255, 193, 7, 0.1)';
                newAlert.style.padding = '15px';
                newAlert.style.borderRadius = '10px';
                newAlert.style.marginBottom = '15px';
                newAlert.innerHTML = `
                    <span class="announcement-tag">اختبار جديد</span>
                    <span class="announcement-title">${quiz.title}</span>
                    <button class="btn btn-secondary btn-sm" style="margin-top:10px; padding: 5px 15px; font-size: 0.8rem;" onclick="startQuiz()">ابدأ الاختبار</button>
                `;
                announcements.prepend(newAlert);

                // Save quiz data for startQuiz function to use
                window.currentQuiz = quiz;
            }
        });
    }
});

function startQuiz() {
    const quiz = window.currentQuiz;
    if (!quiz) return;

    let quizHtml = `<div id="quiz-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:2000; display:flex; align-items:center; justify-content:center; padding:20px;">
        <div class="card" style="max-width:600px; width:100%; background:#0a0e14; padding:40px; border-radius:20px; border:1px solid var(--secondary-color); font-family:'Tajawal', sans-serif;">
            <h2 style="color:var(--secondary-color); margin-bottom:30px; text-align:center;">${quiz.title}</h2>
            <div id="quiz-content">`;

    quiz.questions.forEach((q, i) => {
        quizHtml += `<div class="quiz-q-item" style="margin-bottom:30px; ${i > 0 ? 'display:none' : ''}" id="quiz-q-${i}">
            <p style="font-size:1.2rem; margin-bottom:20px;">السؤال ${i + 1}: ${q.text}</p>
            <div style="display:grid; grid-template-columns:1fr; gap:10px;">
                ${q.options.map((opt, oi) => `<button onclick="nextQ(${i}, ${oi + 1}, ${q.correct})" style="padding:15px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; cursor:pointer; text-align:right;">${opt}</button>`).join('')}
            </div>
        </div>`;
    });

    quizHtml += `</div>
            <div id="quiz-result" style="display:none; text-align:center;">
                <h3 style="font-size:2rem; margin-bottom:20px;">انتهى الاختبار!</h3>
                <p id="score-text" style="font-size:1.5rem; color:var(--secondary-color);"></p>
                <button class="btn btn-primary" style="margin-top:20px;" onclick="closeQuiz()">إغلاق</button>
            </div>
        </div>
    </div>`;

    document.body.insertAdjacentHTML('beforeend', quizHtml);
}

let score = 0;
function nextQ(index, choice, correct) {
    if (choice == correct) score++;

    const current = document.getElementById('quiz-q-' + index);
    const next = document.getElementById('quiz-q-' + (index + 1));

    current.style.display = 'none';
    if (next) {
        next.style.display = 'block';
    } else {
        const quiz = JSON.parse(localStorage.getItem('latestQuiz'));
        document.getElementById('quiz-result').style.display = 'block';
        document.getElementById('score-text').innerText = `درجتك هي: ${score} من ${quiz.questions.length}`;
    }
}

function closeQuiz() {
    document.getElementById('quiz-overlay').remove();
}

// Mobile Menu Toggle (Simplified)
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');

if (mobileMenu) {
    mobileMenu.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenu.classList.toggle('is-active');
    });
}

// Contact Form Handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get form values
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;

        // WhatsApp number (ending in 66 as requested)
        const whatsappNumber = '201159865466';

        // Construct message
        const encodedText = encodeURIComponent(
            `*رسالة جديدة من الموقع*\n\n` +
            `*الاسم:* ${name}\n` +
            `*رقم الهاتف:* ${phone}\n` +
            `*الرسالة:* ${message}`
        );

        // Redirect to WhatsApp
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');

        // Optional: Reset form
        contactForm.reset();
    });
}
