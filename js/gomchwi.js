/* ==========================================
   Yanggu Gomchwi Festival JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sticky Header
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });

    // Mobile Menu Toggle
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileBtn && navMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // 2. Floating Leaves Particle System
    const leavesContainer = document.getElementById('leaves-container');
    const leafEmojis = ['🌿', '🍃', '🌱', '🍀'];
    
    function spawnLeaf() {
        if (!leavesContainer) return;
        
        const leaf = document.createElement('span');
        leaf.classList.add('leaf-particle');
        
        // Random emoji selection
        leaf.textContent = leafEmojis[Math.floor(Math.random() * leafEmojis.length)];
        
        // Random horizontal start, size, duration, and opacity
        const startX = Math.random() * 100; // in %
        const size = Math.random() * 1.5 + 0.8; // 0.8rem to 2.3rem
        const duration = Math.random() * 8 + 6; // 6s to 14s
        const rotationStart = Math.random() * 360;
        
        leaf.style.left = `${startX}%`;
        leaf.style.fontSize = `${size}rem`;
        leaf.style.animationDuration = `${duration}s`;
        leaf.style.transform = `rotate(${rotationStart}deg)`;
        
        // Slightly random initial top offset so they don't pop in too uniformly
        leaf.style.top = `-40px`;
        
        leavesContainer.appendChild(leaf);
        
        // Remove after animation finishes
        setTimeout(() => {
            leaf.remove();
        }, duration * 1000);
    }
    
    // Spawn initial leaves, then start interval
    if (leavesContainer) {
        for (let i = 0; i < 8; i++) {
            // Spawn with delay
            setTimeout(spawnLeaf, Math.random() * 5000);
        }
        setInterval(spawnLeaf, 1500);
    }

    // 3. Program Tabs Switcher
    const tabButtons = document.querySelectorAll('.program-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Toggle Active Button
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Toggle Active Content with transition
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetTab) {
                    content.classList.add('active');
                }
            });
        });
    });

    // 4. Recipes Database & Modal System
    const recipesData = {
        samgyeopsal: {
            title: "곰취 삼겹살 쌈",
            emoji: "🥩",
            badge: "축제 최고 인기메뉴",
            ingredients: "생 곰취 잎 20장, 삼겹살 400g, 쌈장(또는 보리쌈장) 3큰술, 구운 마늘 5쪽, 고추 1개, 소금 및 후추 약간",
            steps: [
                "신선한 양구 곰취 잎을 흐르는 물에 깨끗이 씻은 뒤 체에 밭쳐 물기를 완전히 제거합니다.",
                "달궈진 프라이팬이나 숯불 화로에 삼겹살을 올려 겉은 바삭하고 속은 촉촉하게 소금, 후추를 쳐가며 구워냅니다.",
                "삼겹살을 구우면서 저민 마늘과 고추도 함께 가볍게 익혀 매운맛을 줄이고 단맛을 돋웁니다.",
                "물기를 뺀 곰취 잎을 손바닥 위에 펼치고, 잘 구워진 따끈한 삼겹살 한 점을 쌈장에 찍어 올립니다.",
                "구운 마늘과 고추를 얹고 곰취 잎을 동그랗게 감싸 한 입에 쏙 넣어 입안 가득 퍼지는 특유의 향을 만끽합니다."
            ],
            tip: "곰취 특유의 쌉싸름하고 알싸한 맛이 삼겹살의 기름진 맛을 완벽하게 잡아주어 물리지 않고 무한히 즐길 수 있습니다. 양구 명품 곰취 막걸리와의 궁합이 매우 훌륭합니다!"
        },
        ssambap: {
            title: "정갈한 곰취 쌈밥",
            emoji: "🍙",
            badge: "웰빙 건강 저칼로리",
            ingredients: "곰취 잎 15장, 밥 2공기, 소금 0.5작은술, 참기름 1큰술, 통깨 1큰술\n*약고추장 재료: 다진 소고기 50g, 고추장 3큰술, 꿀(또는 올리고당) 1큰술, 다진 마늘 0.5큰술, 물 2큰술",
            steps: [
                "깨끗이 씻은 곰취 잎은 김이 오른 찜기에 넣고 딱 30초~1분간 살짝 쪄내어 찬물에 헹군 뒤 물기를 살포시 짜냅니다. (이 과정을 통해 거친 잎이 부드러워집니다.)",
                "팬에 참기름을 두르고 다진 소고기와 마늘을 볶다가, 고추장, 꿀, 물을 넣고 약불에서 자작하게 졸여 걸쭉한 '약고추장'을 만듭니다.",
                "고슬고슬하게 지은 밥에 참기름, 통깨, 미량의 소금을 섞어 고소하고 조화롭게 밑간을 해 둡니다.",
                "찐 곰취 잎을 넓게 펴고 밑간 한 밥을 한 입 크기 경단 모양으로 뭉쳐 올린 뒤, 그 위에 만들어 둔 약고추장을 조금씩 얹습니다.",
                "곰취 잎의 사방을 안쪽으로 오므려 단단하게 쌈밥 주먹밥을 빚어 접시에 정갈하게 담아냅니다."
            ],
            tip: "살짝 쪄낸 곰취는 질감이 매끄러워져 주먹밥 모양을 잡기 매우 편리합니다. 등산용 도시락이나 건강식 피크닉 도시락으로 최고의 인기를 자랑합니다."
        },
        jeon: {
            title: "바삭한 곰취 모듬전",
            emoji: "🥞",
            badge: "남녀노소 취향저격",
            ingredients: "곰취 잎 10장, 부침가루 1.5공기, 찬물(또는 탄산수) 1.2공기, 홍고추 1개, 오징어(또는 새우) 100g, 식용유 넉넉히",
            steps: [
                "곰취 잎은 절반은 얇게 채 썰고, 나머지 절반은 통째로 부치기 위해 줄기 끝부분만 깔끔하게 다듬어 둡니다.",
                "오징어나 새우 등 해산물은 먹기 좋은 크기로 작게 다듬고, 홍고추는 고명용으로 얇고 둥글게 어긋썰어 준비합니다.",
                "볼에 부침가루와 차가운 탄산수(또는 얼음물)를 가볍게 섞어 날가루가 보이지 않을 정도로만 묽은 반죽 옷을 만듭니다.",
                "채 썬 곰취와 해산물을 반죽에 섞어 달궈진 팬에 기름을 넉넉히 두르고 노릇노릇하고 바삭하게 앞뒤로 지져냅니다.",
                "통 곰취 전을 만들 때는 반죽을 얇게 입힌 생 곰취 잎을 펼쳐 팬에 얹고 그 위에 홍고추 고명을 얹어 바삭하게 부쳐냅니다."
            ],
            tip: "반죽을 섞을 때 얼음물이나 탄산수를 사용하면 전의 가장자리가 더욱 과자처럼 바삭해집니다. 향긋한 곰취의 수분이 기름진 전의 느끼함을 덜어줍니다."
        },
        tteok: {
            title: "향긋한 곰취 찰떡",
            emoji: "🍡",
            badge: "전통 웰빙 디저트",
            ingredients: "찹쌀 3컵, 생 곰취 잎 80g, 볶은 콩가루 1컵, 소금 1작은술, 설탕 2큰술, 참기름 약간",
            steps: [
                "찹쌀은 깨끗이 씻어 최소 4시간 이상 충분히 불린 후 체에 받쳐서 물기를 빼 둡니다.",
                "생 곰취 잎은 끓는 소금물에 30초간 데친 다음, 곧바로 찬물에 식혀 물기를 완전히 짜내고 믹서나 절구에 잘게 다지거나 빻아 둡니다.",
                "전기밥솥이나 찜기에 불린 찹쌀과 소금물(물 1.5컵 + 소금)을 넣고 고슬고슬하고 쫀득한 찹쌀밥을 짓습니다.",
                "다 지어진 뜨거운 찹쌀밥에 설탕과 빻은 곰취 잎을 가득 넣고, 절구공이나 주걱으로 쌀알이 뭉개지며 찰기가 극대화될 때까지 힘차게 쳐줍니다.",
                "도마에 참기름을 얇게 바르고 완성된 곰취 떡을 평평하게 편 뒤, 먹기 좋은 크기로 잘라 고소한 콩가루를 사방에 고루 입힙니다."
            ],
            tip: "떡을 칠 때 공기가 많이 들어갈수록 더욱 쫄깃해집니다. 냉동실에 얼려 두었다가 자연 해동하여 구워 먹어도 깊은 맛이 유지됩니다."
        },
        makgeolli: {
            title: "명품 곰취 생막걸리",
            emoji: "🍶",
            badge: "양구 특산 전통 약주",
            ingredients: "양구 곰취 생막걸리 1병, 고소한 모듬전 또는 삼겹살 두부김치, 칠링용 아이스 버킷",
            steps: [
                "양구 명품 곰취 막걸리를 마시기 3시간 전에 냉장고에 넣어 4~6℃의 최적의 칠링 온도로 보관합니다.",
                "막걸리 병 바닥에 가라앉은 쌀 앙금과 상단의 맑은 곰취 정제수가 부드럽게 섞이도록 병을 천천히 위아래로 대여섯 번 회전하며 섞어줍니다.",
                "뚜껑을 열 때 탄산 가스가 자연스럽게 빠져나가도록 살짝 열었다 닫았다를 두세 번 반복하여 넘침을 미연에 방지합니다.",
                "시원하게 축제 분위기를 느낄 수 있는 납작한 전통 놋그릇이나 사발 잔에 막걸리를 넘치지 않게 찰랑찰랑 채워 담습니다.",
                "첫 입을 마실 때 바로 삼키지 말고 혀끝에 머금어 곰취의 향긋한 허브 풀 향과 부드럽고 톡 쏘는 발효 유산균의 풍미를 천천히 음미합니다."
            ],
            tip: "양구 곰취 생막걸리는 인공 감미료를 최소화하고 천연 암반수로 빚어 뒤끝이 깔끔하고 숙취가 적은 것이 가장 큰 자랑거리입니다."
        }
    };

    const recipeModal = document.getElementById('gourmet-modal');
    const modalEmoji = document.getElementById('modal-gourmet-emoji');
    const modalTitle = document.getElementById('modal-gourmet-title');
    const modalBadge = document.getElementById('modal-gourmet-badge');
    const modalIngredients = document.getElementById('modal-gourmet-ingredients');
    const modalSteps = document.getElementById('modal-gourmet-steps');
    const modalTip = document.getElementById('modal-gourmet-tip');
    const closeRecipeBtn = document.getElementById('close-gourmet-modal');

    document.querySelectorAll('.gourmet-card').forEach(card => {
        card.addEventListener('click', () => {
            const recipeId = card.getAttribute('data-recipe');
            const data = recipesData[recipeId];
            
            if (data && recipeModal) {
                // Populate Modal Data
                modalEmoji.textContent = data.emoji;
                modalTitle.textContent = data.title;
                modalBadge.textContent = data.badge;
                modalIngredients.innerHTML = data.ingredients.replace(/\n/g, '<br>');
                
                // Populate Steps List
                modalSteps.innerHTML = '';
                data.steps.forEach(step => {
                    const li = document.createElement('li');
                    li.textContent = step;
                    modalSteps.appendChild(li);
                });
                
                modalTip.textContent = data.tip;
                
                // Show Modal
                recipeModal.style.display = 'flex';
                void recipeModal.offsetWidth; // Reflow
                recipeModal.classList.add('show');
            }
        });
    });

    const closeGourmetModal = () => {
        if (recipeModal) {
            recipeModal.classList.remove('show');
            setTimeout(() => {
                if (!recipeModal.classList.contains('show')) {
                    recipeModal.style.display = 'none';
                }
            }, 250);
        }
    };

    if (closeRecipeBtn) {
        closeRecipeBtn.addEventListener('click', closeGourmetModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            closeGourmetModal();
        }
    });

    // 5. Sound Synthesizer via Web Audio API (No files needed!)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    function playSynthSound(type) {
        // Double check audio context state (safari autoblackout fix)
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        const now = audioCtx.currentTime;
        
        if (type === 'catch') {
            // High-pitched sweet ping for Gomchwi
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5
            
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'weed') {
            // Low pitched buzz for Poison Weed
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(70, now + 0.2);
            
            gainNode.gain.setValueAtTime(0.12, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
            
            osc.start(now);
            osc.stop(now + 0.23);
        } else if (type === 'withered') {
            // Mild thud for withered leaf
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.linearRampToValueAtTime(110, now + 0.15);
            
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.17);
            
            osc.start(now);
            osc.stop(now + 0.17);
        } else if (type === 'gameover') {
            // Fun little celebration melody at game over
            const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
            notes.forEach((freq, i) => {
                const noteOsc = audioCtx.createOscillator();
                const noteGain = noteOsc.connect(audioCtx.createGain());
                noteGain.connect(audioCtx.destination);
                
                noteOsc.type = 'sine';
                noteOsc.frequency.setValueAtTime(freq, now + i * 0.1);
                
                noteGain.gain.setValueAtTime(0, now);
                noteGain.gain.linearRampToValueAtTime(0.1, now + i * 0.1 + 0.02);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
                
                noteOsc.start(now + i * 0.1);
                noteOsc.stop(now + i * 0.1 + 0.35);
            });
        }
    }


    // 6. Interactive Canvas Game Engine (Gomchwi Picker)
    const canvas = document.getElementById('game-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        const startBtn = document.getElementById('start-game-btn');
        const overlay = document.getElementById('game-overlay');
        const overlayTitle = document.getElementById('overlay-title');
        const overlayDesc = document.getElementById('overlay-desc');
        
        const hudScore = document.getElementById('game-score');
        const hudTime = document.getElementById('game-time');
        const hudHighScore = document.getElementById('game-high-score');
        
        const btnLeft = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');

        // Retrieve local storage high score
        let highScore = parseInt(localStorage.getItem('gomchwi_high_score') || '0');
        if (hudHighScore) hudHighScore.textContent = highScore;

        // Game Settings
        let gameActive = false;
        let score = 0;
        let timeRemaining = 20; // 20 seconds
        let gameTimer = null;
        let animationFrameId = null;

        // Player / Basket Definition
        const basket = {
            x: 350,
            y: 380,
            width: 110,
            height: 45,
            speed: 15,
            targetX: 350, // For smooth mouse/touch transition
            emoji: '🧺',
            draw() {
                // Outer glow shadow
                ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
                ctx.shadowBlur = 8;
                ctx.shadowOffsetY = 4;

                // Draw wood woven basket shape
                ctx.fillStyle = '#8d6e63'; // Brown base
                ctx.beginPath();
                ctx.roundRect(this.x, this.y, this.width, this.height, [0, 0, 20, 20]);
                ctx.fill();

                // Draw rim
                ctx.fillStyle = '#5d4037';
                ctx.fillRect(this.x - 5, this.y, this.width + 10, 10);

                // Draw woven patterns (stripes)
                ctx.strokeStyle = '#5d4037';
                ctx.lineWidth = 2;
                ctx.shadowBlur = 0; // reset shadow
                ctx.shadowOffsetY = 0;
                
                // Horizontal weave lines
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + 20);
                ctx.lineTo(this.x + this.width, this.y + 20);
                ctx.moveTo(this.x, this.y + 32);
                ctx.lineTo(this.x + this.width, this.y + 32);
                ctx.stroke();

                // Vertical grid ribs
                ctx.beginPath();
                for (let i = 15; i < this.width; i += 20) {
                    ctx.moveTo(this.x + i, this.y + 10);
                    ctx.lineTo(this.x + i, this.y + this.height);
                }
                ctx.stroke();

                // Draw cute green leaf decoration in center
                ctx.fillStyle = '#aed581';
                ctx.beginPath();
                ctx.ellipse(this.x + this.width/2, this.y + 25, 8, 12, Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#81c784';
                ctx.beginPath();
                ctx.ellipse(this.x + this.width/2, this.y + 25, 8, 12, -Math.PI / 4, 0, 2 * Math.PI);
                ctx.fill();
            }
        };

        // Item Pool (Floating leaves)
        let items = [];
        const itemTypes = [
            { type: 'gomchwi', emoji: '🌿', color: '#4caf50', score: 10, speedMin: 2, speedMax: 4.5, spawnWeight: 0.65 },
            { type: 'withered', emoji: '🍂', color: '#ffb74d', score: -5, speedMin: 1.5, speedMax: 3.5, spawnWeight: 0.20 },
            { type: 'weed', emoji: '☠️', color: '#ba68c8', score: -10, speedMin: 3.5, speedMax: 6, spawnWeight: 0.15 }
        ];

        class FallingItem {
            constructor() {
                // Determine item type based on weights
                const rand = Math.random();
                if (rand < 0.65) {
                    this.info = itemTypes[0]; // Gomchwi
                } else if (rand < 0.85) {
                    this.info = itemTypes[1]; // Withered
                } else {
                    this.info = itemTypes[2]; // Weed
                }

                this.width = 30;
                this.height = 30;
                this.x = Math.random() * (canvas.width - this.width - 20) + 10;
                this.y = -50;
                this.speed = Math.random() * (this.info.speedMax - this.info.speedMin) + this.info.speedMin;
                
                // Sway parameters for realistic leaf floating
                this.swaySpeed = Math.random() * 0.05 + 0.02;
                this.swayWidth = Math.random() * 30 + 15;
                this.swayOffset = Math.random() * Math.PI * 2;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotSpeed = (Math.random() - 0.5) * 0.05;
                
                this.baseX = this.x;
            }

            update() {
                this.y += this.speed;
                // Sinusoidal sway
                this.x = this.baseX + Math.sin(this.y * this.swaySpeed + this.swayOffset) * this.swayWidth;
                this.rotation += this.rotSpeed;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x + this.width/2, this.y + this.height/2);
                ctx.rotate(this.rotation);
                
                // Draw leaf/skull emoji representing the item
                ctx.font = '28px Noto Sans KR';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Add soft item glow
                ctx.shadowColor = this.info.color;
                ctx.shadowBlur = 10;
                
                ctx.fillText(this.info.emoji, 0, 0);
                ctx.restore();
            }
        }

        // Floating Text Popups (+10 or -10 indicators)
        let floatingTexts = [];
        class FloatingText {
            constructor(x, y, text, color) {
                this.x = x;
                this.y = y;
                this.text = text;
                this.color = color;
                this.opacity = 1;
                this.speedY = -1.2;
            }
            update() {
                this.y += this.speedY;
                this.opacity -= 0.03;
            }
            draw() {
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.opacity);
                ctx.fillStyle = this.color;
                ctx.font = 'bold 20px Outfit, Noto Sans KR';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 4;
                ctx.fillText(this.text, this.x, this.y);
                ctx.restore();
            }
        }

        // Controls Setup
        let keys = {};
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                keys[e.key] = true;
                e.preventDefault(); // prevent scrolling
            }
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                keys[e.key] = false;
            }
        });

        // Mouse & Touch Controls (tracks horizontal position dynamically)
        const updateBasketTarget = (clientX) => {
            const rect = canvas.getBoundingClientRect();
            // Scale mouse coordinates relative to canvas width
            const relativeX = (clientX - rect.left) / rect.width * canvas.width;
            basket.targetX = Math.max(0, Math.min(canvas.width - basket.width, relativeX - basket.width / 2));
        };

        canvas.addEventListener('mousemove', (e) => {
            if (!gameActive) return;
            updateBasketTarget(e.clientX);
        });

        canvas.addEventListener('touchmove', (e) => {
            if (!gameActive) return;
            if (e.touches && e.touches[0]) {
                updateBasketTarget(e.touches[0].clientX);
            }
        }, { passive: true });

        // Mobile Buttons Click Events
        let leftPressed = false;
        let rightPressed = false;

        btnLeft.addEventListener('mousedown', () => { leftPressed = true; });
        btnLeft.addEventListener('mouseup', () => { leftPressed = false; });
        btnLeft.addEventListener('touchstart', (e) => { leftPressed = true; e.preventDefault(); }, {passive: false});
        btnLeft.addEventListener('touchend', (e) => { leftPressed = false; e.preventDefault(); }, {passive: false});

        btnRight.addEventListener('mousedown', () => { rightPressed = true; });
        btnRight.addEventListener('mouseup', () => { rightPressed = false; });
        btnRight.addEventListener('touchstart', (e) => { rightPressed = true; e.preventDefault(); }, {passive: false});
        btnRight.addEventListener('touchend', (e) => { rightPressed = false; e.preventDefault(); }, {passive: false});


        // Spawning Item Loops
        let spawnTimer = 0;
        function updateGame() {
            if (!gameActive) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw a beautiful canvas background gradient representing a forest clearing
            const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGrad.addColorStop(0, '#81d4fa'); // Light blue sky
            skyGrad.addColorStop(0.4, '#e8f5e9'); // Mint glow
            skyGrad.addColorStop(1, '#aed581'); // Fresh grass green
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw cartoonish green hills scenery in background
            ctx.fillStyle = '#81c784';
            ctx.beginPath();
            ctx.arc(200, 480, 250, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#66bb6a';
            ctx.beginPath();
            ctx.arc(650, 520, 300, 0, Math.PI * 2);
            ctx.fill();

            // Keyboard and Button Movements
            if (keys['ArrowLeft'] || leftPressed) {
                basket.targetX = Math.max(0, basket.targetX - basket.speed);
            }
            if (keys['ArrowRight'] || rightPressed) {
                basket.targetX = Math.min(canvas.width - basket.width, basket.targetX + basket.speed);
            }

            // Smooth basket interpolation towards targetX (reduces stutter, adds juice!)
            basket.x += (basket.targetX - basket.x) * 0.25;

            // Render Basket
            basket.draw();

            // Spawn items based on frame interval
            spawnTimer++;
            if (spawnTimer > 28) { // approximately every 0.5 seconds
                items.push(new FallingItem());
                spawnTimer = 0;
            }

            // Update & Draw Items
            for (let i = items.length - 1; i >= 0; i--) {
                const item = items[i];
                item.update();
                item.draw();

                // Check out of bounds
                if (item.y > canvas.height) {
                    items.splice(i, 1);
                    continue;
                }

                // Check collision with the Basket
                const collides = (
                    item.y + item.height - 5 >= basket.y &&
                    item.y <= basket.y + basket.height &&
                    item.x + item.width >= basket.x &&
                    item.x <= basket.x + basket.width
                );

                if (collides) {
                    // Update Score
                    score += item.info.score;
                    if (score < 0) score = 0; // clamp score to positive values
                    if (hudScore) hudScore.textContent = score;

                    // Play Synthesizer Sound
                    if (item.info.type === 'gomchwi') {
                        playSynthSound('catch');
                        floatingTexts.push(new FloatingText(item.x + 10, basket.y - 15, `+${item.info.score}`, '#aed581'));
                    } else if (item.info.type === 'withered') {
                        playSynthSound('withered');
                        floatingTexts.push(new FloatingText(item.x + 10, basket.y - 15, `${item.info.score}`, '#ffb74d'));
                    } else {
                        playSynthSound('weed');
                        floatingTexts.push(new FloatingText(item.x + 10, basket.y - 15, `${item.info.score}`, '#e57373'));
                    }

                    // Remove item
                    items.splice(i, 1);
                }
            }

            // Render & Update Floating text popups
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                const txt = floatingTexts[i];
                txt.update();
                txt.draw();
                if (txt.opacity <= 0) {
                    floatingTexts.splice(i, 1);
                }
            }

            // Loop Frame
            animationFrameId = requestAnimationFrame(updateGame);
        }

        // Start / Reset / Stop loops
        const startGame = () => {
            // Resume AudioContext just in case browser requires touch triggers
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }

            // Reset scores & times
            score = 0;
            timeRemaining = 20;
            items = [];
            floatingTexts = [];
            gameActive = true;
            spawnTimer = 0;

            if (hudScore) hudScore.textContent = score;
            if (hudTime) hudTime.textContent = `${timeRemaining}s`;

            // Reset player coordinates
            basket.x = canvas.width / 2 - basket.width / 2;
            basket.targetX = basket.x;

            // Hide Overlay
            overlay.style.opacity = '0';
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);

            // Start Game Timer
            clearInterval(gameTimer);
            gameTimer = setInterval(() => {
                timeRemaining--;
                if (hudTime) hudTime.textContent = `${timeRemaining}s`;

                // Timer complete
                if (timeRemaining <= 0) {
                    endGame();
                }
            }, 1000);

            // Kick off animation frames
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            updateGame();
        };

        const endGame = () => {
            gameActive = false;
            clearInterval(gameTimer);
            cancelAnimationFrame(animationFrameId);

            // Audio FX
            playSynthSound('gameover');

            // Save High Score
            let newRecord = false;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('gomchwi_high_score', highScore);
                if (hudHighScore) hudHighScore.textContent = highScore;
                newRecord = true;
            }

            // Show Game Over Overlay
            overlayTitle.textContent = newRecord ? '🏆 NEW RECORD!' : '🌿 채취 완료!';
            
            // Build informative feedback
            let feedback = `당신은 싱싱한 양구 곰취를 채취하여 총 ${score}점을 획득하셨습니다!`;
            if (score >= 120) {
                feedback += `<br><span style="color:#fff176; font-weight:700;">대단합니다! 당신은 진정한 '로얄 곰취 명인'입니다! 👑</span>`;
            } else if (score >= 70) {
                feedback += `<br><span style="color:#aed581; font-weight:700;">훌륭합니다! 양구 곰취 밭을 지켜내셨어요! 💚</span>`;
            } else {
                feedback += `<br>조금 더 집중해서 잡초와 독초를 피해 채취해 보세요! 화이팅! ✊`;
            }
            overlayDesc.innerHTML = feedback;

            startBtn.textContent = '다시 도전하기';
            
            overlay.style.display = 'flex';
            void overlay.offsetWidth;
            overlay.style.opacity = '1';
        };

        // Attach Trigger to button
        startBtn.addEventListener('click', startGame);
    }
});
