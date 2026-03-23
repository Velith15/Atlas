document.addEventListener('DOMContentLoaded', () => {
    // Initialize Lucide icons
    lucide.createIcons();

    // Navigation scroll effect
    const nav = document.getElementById('main-nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 30 || document.body.contains(document.querySelector('.subpage-main'))) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Intersection Observer for Reveal Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.getAttribute('data-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('reveal-visible');
                }, delay);
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left');
    revealElements.forEach(el => revealObserver.observe(el));

    // Subtle Parallax Effect for Hero Image
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const parallaxEls = document.querySelectorAll('.parallax-el');
        
        parallaxEls.forEach(el => {
            const speed = el.getAttribute('data-speed') || 2;
            const yPos = -(scrolled * speed / 20);
            el.style.transform = `translateY(${yPos}px)`;
        });
    });

    // Header opacity logic
    window.addEventListener('scroll', () => {
        const opacity = Math.min(window.scrollY / 500, 0.8);
        if (window.scrollY > 30) {
            nav.style.backgroundColor = `rgba(255, 255, 255, ${opacity})`;
        } else {
            nav.style.backgroundColor = `rgba(255, 255, 255, 0)`;
        }
    });

    // Background Canvas Animation
    // Background Canvas Animation Refined
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    const particleCount = 45; // Increased from 28
    const connectionDistance = 250; // Increased

    class Particle {
        constructor() {
            this.init();
        }

        init() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Extremely slow drifting
            this.vx = (Math.random() - 0.5) * 0.15;
            this.vy = (Math.random() - 0.5) * 0.15;
            this.size = Math.random() * 2 + 1; // Increased
            // Depth factor for parallax (0.5 to 1.5)
            this.depth = Math.random() * 1.2 + 0.3;
            // Opacity variance
            this.alpha = Math.random() * 0.4 + 0.4; // Boosted
        }

        update(scrollOffset) {
            this.x += this.vx;
            this.y += this.vy;

            // Apply subtle parallax based on scroll
            const scrollY = window.scrollY * 0.05 * this.depth;
            const drawY = this.y - scrollY;

            // Wrap around screen
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < -100) this.y = height + 100;
            if (this.y > height + 100) this.y = -100;
            
            return drawY;
        }

        draw(drawY) {
            ctx.beginPath();
            ctx.arc(this.x, drawY, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(191, 191, 191, ${this.alpha})`; // #BFBFBF
            ctx.fill();
        }
    }

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < particles.length; i++) {
            const p1 = particles[i];
            const drawY1 = p1.update();
            p1.draw(drawY1);

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const drawY2 = p2.y - (window.scrollY * 0.05 * p2.depth);
                
                const dx = p1.x - p2.x;
                const dy = drawY1 - drawY2;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const opacity = (1 - dist / connectionDistance) * 0.65; // Boosted
                    ctx.beginPath();
                    ctx.moveTo(p1.x, drawY1);
                    ctx.lineTo(p2.x, drawY2);
                    ctx.strokeStyle = `rgba(138, 138, 138, ${opacity})`;
                    ctx.lineWidth = 1; // Thickened
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    if (document.getElementById('bg-canvas')) {
        window.addEventListener('resize', resize);
        resize();
        animate();
    }

    // Global Floating Arri Widget
    function createFloatingWidget() {
        // Create widget container
        const widgetContainer = document.createElement('div');
        widgetContainer.id = 'arri-floating-widget';
        widgetContainer.className = 'arri-floating-widget';

        // Widget HTML structure
        widgetContainer.innerHTML = `
            <div class="arri-chat-window" id="arri-chat-window">
                <div class="chat-header">
                    <div class="chat-title">
                        <span class="status-dot"></span>
                        <span>Arri — Atlas Lab Support</span>
                    </div>
                    <img src="assets/logo.png" alt="Atlas" class="chat-logo">
                </div>
                
                <div class="chat-messages" id="chat-messages">
                    <div class="message ai-message">
                        <div class="message-content">
                            <p>Hi! I'm Arri, your Atlas Lab assistant. How can I help you architect your workflows today?</p>
                        </div>
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <div class="chat-input-hint">Arri is available 24/7 to help with Atlas.</div>
                    <div class="chat-input-area">
                        <input type="text" id="chat-input" placeholder="Ask Arri anything about Atlas...">
                        <button id="send-btn" class="btn-icon"><i data-lucide="send"></i></button>
                    </div>
                </div>
            </div>
            
            <button class="arri-fab" id="arri-fab">
                <img src="assets/logo.png" alt="Arri" class="fab-icon">
            </button>
        `;

        document.body.appendChild(widgetContainer);

        // Re-initialize lucide icons for the newly injected HTML
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Logic bindings
        const fab = document.getElementById('arri-fab');
        const chatWindow = document.getElementById('arri-chat-window');
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-btn');
        const chatMessages = document.getElementById('chat-messages');

        let chatHistory = [];
        let isOpen = false;

        fab.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                chatWindow.classList.add('active');
                fab.classList.add('active');
                setTimeout(() => chatInput.focus(), 300);
            } else {
                chatWindow.classList.remove('active');
                fab.classList.remove('active');
            }
        });

        const addMessage = (text, sender) => {
            const msgDiv = document.createElement('div');
            msgDiv.className = `message ${sender}-message`;
            
            if (text === 'typing') {
                msgDiv.id = 'typing-indicator';
                msgDiv.innerHTML = `
                    <div class="message-content">
                        <div class="typing-indicator">
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                        </div>
                    </div>
                `;
            } else {
                msgDiv.innerHTML = `<div class="message-content"><p>${text}</p></div>`;
                if (sender !== 'typing') chatHistory.push({ role: sender === 'user' ? 'user' : 'assistant', content: text });
            }
            
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        };

        const handleSend = async () => {
            const text = chatInput.value.trim();
            if (!text) return;

            // User message
            chatInput.value = '';
            addMessage(text, 'user');

            // Show typing
            addMessage('typing', 'ai');

            try {
                // Call backend (local or production)
                const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                    ? 'http://localhost:3000/api/chat' 
                    : '/api/chat';
                
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: chatHistory })
                });

                const data = await response.json();
                
                // Remove typing indicator
                const typingInd = document.getElementById('typing-indicator');
                if (typingInd) typingInd.remove();

                if (data.reply) {
                    addMessage(data.reply, 'ai');
                } else {
                    addMessage("I'm sorry, my systems are currently unreachable. Please try again later.", 'ai');
                }
            } catch (err) {
                const typingInd = document.getElementById('typing-indicator');
                if (typingInd) typingInd.remove();
                addMessage("Connection error to Arri services.", 'ai');
            }
        };

        sendBtn.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

    // Initialize the widget only on the support page
    if (window.location.href.includes('support.html') || window.location.pathname.includes('/support')) {
        createFloatingWidget();
    }

});
