/* ============================================
   Anisa's 60th Birthday - Iceland Adventure
   Main Application JavaScript
   ============================================ */

(function () {
  'use strict';

  // ---- Configuration ----
  const TRIP_DATE = new Date('2026-07-30T00:00:00');
  const STORAGE_KEY = 'anisa60_messages';
  const USER_KEY = 'anisa60_user';

  // ---- State ----
  let currentUser = localStorage.getItem(USER_KEY) || '';
  let currentCategory = 'general';
  let messages = loadMessages();

  // ---- DOM Elements ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ---- Countdown Timer ----
  function updateCountdown() {
    const now = new Date();
    const diff = TRIP_DATE - now;

    if (diff <= 0) {
      $('#days').textContent = '0';
      $('#hours').textContent = '0';
      $('#minutes').textContent = '0';
      $('#seconds').textContent = '0';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    $('#days').textContent = days;
    $('#hours').textContent = hours.toString().padStart(2, '0');
    $('#minutes').textContent = minutes.toString().padStart(2, '0');
    $('#seconds').textContent = seconds.toString().padStart(2, '0');
  }

  // ---- Navigation ----
  function initNav() {
    const nav = $('#nav');
    const toggle = $('#navToggle');
    const links = $('#navLinks');
    const navLinks = $$('.nav-link');

    // Scroll effect
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile toggle
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });

    // Close mobile menu on link click
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        links.classList.remove('open');
      });
    });

    // Active link on scroll
    const sections = $$('section[id]');
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach((section) => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) {
          current = section.getAttribute('id');
        }
      });
      navLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
      });
    });
  }

  // ---- Timeline Animation ----
  function initTimelineAnimations() {
    const items = $$('.timeline-item');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    items.forEach((item, index) => {
      item.style.transitionDelay = `${index * 0.15}s`;
      observer.observe(item);
    });
  }

  // ---- Messages / Chat ----
  function loadMessages() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : getSampleMessages();
    } catch {
      return getSampleMessages();
    }
  }

  function getSampleMessages() {
    return [
      {
        id: 1,
        sender: 'Trip Coordinator',
        text: 'Welcome everyone! Use this space to coordinate travel plans, share excitement, and send birthday wishes to Anisa! 🇮🇸',
        category: 'general',
        timestamp: Date.now() - 86400000,
        isSystem: true,
      },
      {
        id: 2,
        sender: 'Trip Coordinator',
        text: 'Reminder: We\'re looking at 20 travellers. Please confirm your attendance and any room sharing arrangements as soon as possible.',
        category: 'logistics',
        timestamp: Date.now() - 43200000,
        isSystem: true,
      },
    ];
  }

  function saveMessages() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // Storage full or unavailable
    }
  }

  function formatTime(ts) {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) return time;
    if (isYesterday) return `Yesterday ${time}`;
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`;
  }

  function formatDateSeparator(ts) {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }

  function renderMessages() {
    const container = $('#chatMessages');
    const welcome = container.querySelector('.chat-welcome');

    // Clear messages but keep welcome
    const existingMessages = container.querySelectorAll('.message, .date-separator');
    existingMessages.forEach((el) => el.remove());

    if (messages.length === 0) {
      if (welcome) welcome.style.display = '';
      updateMessageCount();
      return;
    }

    if (welcome) welcome.style.display = 'none';

    let lastDate = '';

    messages.forEach((msg) => {
      const msgDate = new Date(msg.timestamp).toDateString();

      // Add date separator if new day
      if (msgDate !== lastDate) {
        lastDate = msgDate;
        const sep = document.createElement('div');
        sep.className = 'date-separator';
        sep.innerHTML = `<span>${formatDateSeparator(msg.timestamp)}</span>`;
        container.appendChild(sep);
      }

      const isOwn = msg.sender === currentUser;
      const div = document.createElement('div');
      div.className = `message ${isOwn ? 'own' : 'other'}`;
      div.innerHTML = `
        <div class="message-bubble">
          ${!isOwn ? `<div class="message-sender">${escapeHtml(msg.sender)}</div>` : ''}
          <div class="message-text">${escapeHtml(msg.text)}</div>
          <div class="message-meta">
            <span class="message-time">${formatTime(msg.timestamp)}</span>
            <span class="message-category ${msg.category}">${msg.category}</span>
          </div>
        </div>
      `;
      container.appendChild(div);
    });

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    updateMessageCount();
  }

  function updateMessageCount() {
    const count = messages.length;
    $('#memberCount').textContent = `${count} message${count !== 1 ? 's' : ''}`;
  }

  function addMessage(text, category) {
    const msg = {
      id: Date.now(),
      sender: currentUser,
      text: text.trim(),
      category: category,
      timestamp: Date.now(),
    };
    messages.push(msg);
    saveMessages();
    renderMessages();
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function initChat() {
    const nameEntry = $('#nameEntry');
    const chatContainer = $('#chatContainer');
    const userName = $('#userName');
    const joinBtn = $('#joinBtn');
    const changeNameBtn = $('#changeName');
    const messageInput = $('#messageInput');
    const sendBtn = $('#sendBtn');
    const categoryBtns = $$('.category-btn');

    // Check if user already joined
    if (currentUser) {
      nameEntry.style.display = 'none';
      chatContainer.style.display = 'flex';
      renderMessages();
    }

    // Join
    function joinChat() {
      const name = userName.value.trim();
      if (!name) return;
      currentUser = name;
      localStorage.setItem(USER_KEY, currentUser);
      nameEntry.style.display = 'none';
      chatContainer.style.display = 'flex';
      renderMessages();
    }

    joinBtn.addEventListener('click', joinChat);
    userName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') joinChat();
    });

    // Change name
    changeNameBtn.addEventListener('click', () => {
      const newName = prompt('Enter your new name:', currentUser);
      if (newName && newName.trim()) {
        currentUser = newName.trim();
        localStorage.setItem(USER_KEY, currentUser);
        renderMessages();
      }
    });

    // Category selection
    categoryBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        categoryBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentCategory = btn.dataset.category;
      });
    });

    // Send message
    function sendMessage() {
      const text = messageInput.value.trim();
      if (!text) return;
      addMessage(text, currentCategory);
      messageInput.value = '';
      messageInput.style.height = 'auto';
      messageInput.focus();
    }

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
      messageInput.style.height = 'auto';
      messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
    });

    // Listen for storage events from other tabs
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) {
        messages = loadMessages();
        renderMessages();
      }
    });
  }

  // ---- Smooth scroll for nav links ----
  function initSmoothScroll() {
    $$('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  // ---- Maps ----
  function initMaps() {
    // Map 1: Overview of Iceland
    const map1 = L.map('map1', { scrollWheelZoom: false }).setView([64.963, -19.021], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map1);

    // Map 2: Trip locations with markers
    const map2 = L.map('map2', { scrollWheelZoom: false }).setView([64.1, -20.7], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map2);

    var locations = [
      { name: 'Reykjavik', lat: 64.1466, lng: -21.9426 },
      { name: 'Black Sand Hotel', lat: 63.6191, lng: -19.6498 },
      { name: 'Fri\u00F0heimar Greenhouse', lat: 64.1297, lng: -20.6627 },
      { name: 'Gullfoss', lat: 64.3271, lng: -20.1199 },
      { name: '\u00DEingvellir', lat: 64.2559, lng: -21.1290 },
      { name: 'Geysir', lat: 64.3103, lng: -20.3024 },
      { name: 'Blue Lagoon', lat: 63.8804, lng: -22.4495 },
      { name: 'Raufarh\u00F3lshellir Lava Tunnel', lat: 63.9364, lng: -21.3961 },
      { name: 'Keflav\u00EDk Airport (KEF)', lat: 63.9850, lng: -22.6056 },
    ];

    locations.forEach(function (loc) {
      L.marker([loc.lat, loc.lng]).addTo(map2).bindPopup(loc.name);
    });
  }

  // ---- Initialize ----
  function init() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
    initNav();
    initSmoothScroll();
    initTimelineAnimations();
    initChat();
    initMaps();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
