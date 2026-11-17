const app = document.getElementById('app');
let playBtn, settingsBtn, creditsBtn, tauntText;

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let prevMouseX = mouseX;
let prevMouseY = mouseY;

let btnX = 0;
let btnY = 0;
let btnVx = 0;
let btnVy = 0;

let dodgeCount = 0;
let isCaught = false;
let gameStarted = false;
let startTime = 0;
let totalRunStartTime = 0;
let finalRunTime = 0;
let playerName = "";
let isAnonymous = false;

const fullSpeedDuration = 3000;
const totalDecayDuration = 20000;

const taunts = [
    "Hmm, where did the other options go?",
    "Did Play just run away with the menu?",
    "No turning back now.",
    "Getting tired of chasing it?",
    "Almost had it!",
    "It's slowing down... keep going!"
];

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

initLevel1();

function initLevel1() {
    app.innerHTML = `
      <div class="menu-container" id="menu-screen">
        <div>
          <h1>CHRONO QUEST</h1>
          <div class="subtitle" id="taunt-text">Select an option to begin your adventure.</div>
        </div>
        <div class="menu-buttons" id="button-group">
          <button class="menu-btn" id="play-btn">Play Game</button>
          <button class="menu-btn" id="settings-btn">Settings</button>
          <button class="menu-btn" id="credits-btn">Credits</button>
        </div>
      </div>
    `;

    playBtn = document.getElementById('play-btn');
    settingsBtn = document.getElementById('settings-btn');
    creditsBtn = document.getElementById('credits-btn');
    tauntText = document.getElementById('taunt-text');

    settingsBtn.addEventListener('mouseenter', () => {
        const sRect = settingsBtn.getBoundingClientRect();
        settingsBtn.style.position = 'fixed';
        settingsBtn.style.left = `${sRect.left}px`;
        settingsBtn.style.top = `${sRect.top}px`;
        settingsBtn.getBoundingClientRect();
        settingsBtn.style.transform = 'translate(-150vw, -80vh) rotate(-45deg)';
        settingsBtn.style.opacity = '0';
        setTimeout(() => settingsBtn.remove(), 600);
    });

    creditsBtn.addEventListener('mouseenter', () => {
        const cRect = creditsBtn.getBoundingClientRect();
        creditsBtn.style.position = 'fixed';
        creditsBtn.style.left = `${cRect.left}px`;
        creditsBtn.style.top = `${cRect.top}px`;
        creditsBtn.getBoundingClientRect();
        creditsBtn.style.transform = 'translate(150vw, 80vh) rotate(45deg)';
        creditsBtn.style.opacity = '0';
        setTimeout(() => creditsBtn.remove(), 600);
    });

    playBtn.addEventListener('mouseenter', () => {
        if (!gameStarted) {
            gameStarted = true;
            totalRunStartTime = performance.now();
            startTime = performance.now();

            const pRect = playBtn.getBoundingClientRect();
            playBtn.style.position = 'fixed';
            btnX = pRect.left;
            btnY = pRect.top;
            playBtn.style.left = `${btnX}px`;
            playBtn.style.top = `${btnY}px`;
            playBtn.style.transition = 'none';

            tauntText.textContent = "Catch it if you can!";
            requestAnimationFrame(level1PhysicsLoop);
        }
    });

    window.addEventListener('keydown', handleKeydown);
    playBtn.addEventListener('click', handlePlayClick);
}

function handleKeydown(e) {
    if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Tab') && !isCaught && gameStarted) {
        e.preventDefault();
        tauntText.textContent = "Keyboard shortcuts are disabled for fair play!";
    }
}

function level1PhysicsLoop() {
    if (!gameStarted || isCaught) return;

    const rect = playBtn.getBoundingClientRect();
    const btnCenterX = btnX + rect.width / 2;
    const btnCenterY = btnY + rect.height / 2;

    const dx = btnCenterX - mouseX;
    const dy = btnCenterY - mouseY;
    const distance = Math.hypot(dx, dy);

    const elapsed = performance.now() - startTime;
    let fatigueMultiplier = 1.0;
    if (elapsed > fullSpeedDuration) {
        const timeInDecay = elapsed - fullSpeedDuration;
        const progress = Math.min(timeInDecay / totalDecayDuration, 1.0);
        const easedProgress = progress * progress * (3 - 2 * progress);
        fatigueMultiplier = 1.0 - (easedProgress * 0.93);
    }

    const mouseSpeed = Math.hypot(mouseX - prevMouseX, mouseY - prevMouseY);
    prevMouseX = mouseX;
    prevMouseY = mouseY;

    const panicRadius = (120 + Math.min(mouseSpeed * 1.2, 100)) * fatigueMultiplier;

    if (distance < panicRadius) {
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.6;
        const targetVx = Math.cos(angle) * (14 * fatigueMultiplier);
        const targetVy = Math.sin(angle) * (14 * fatigueMultiplier);

        btnVx += (targetVx - btnVx) * 0.2;
        btnVy += (targetVy - btnVy) * 0.2;

        dodgeCount++;
        if (dodgeCount % 45 === 0) {
            tauntText.textContent = taunts[Math.floor(Math.random() * taunts.length)];
        }
    } else {
        btnVx *= 0.85;
        btnVy *= 0.85;
    }

    btnX += btnVx;
    btnY += btnVy;

    const pad = 20;
    const maxX = window.innerWidth - rect.width - pad;
    const maxY = window.innerHeight - rect.height - pad;

    if (btnX < pad) { btnX = pad; btnVx *= -0.5; }
    if (btnX > maxX) { btnX = maxX; btnVx *= -0.5; }
    if (btnY < pad) { btnY = pad; btnVy *= -0.5; }
    if (btnY > maxY) { btnY = maxY; btnVy *= -0.5; }

    playBtn.style.left = `${btnX}px`;
    playBtn.style.top = `${btnY}px`;

    requestAnimationFrame(level1PhysicsLoop);
}

function handlePlayClick() {
    isCaught = true;
    window.removeEventListener('keydown', handleKeydown);

    playBtn.style.background = '#238636';
    playBtn.textContent = "CONNECTED!";
    tauntText.textContent = "Level 1 Cleared! Registering player profile...";

    setTimeout(startNamePrompt, 1200);
}

// --- NAME PROMPT SCREEN (Between Level 1 and Level 2) ---
function startNamePrompt() {
    app.innerHTML = `
      <div class="box-container" style="width: 380px; text-align: center;">
        <h2 style="margin-top:0; color: #ffffff;">Player Identity</h2>
        <p style="font-size: 0.85rem; color: #8b949e; margin-bottom: 20px;">
          Choose a username to benchmark your stats, or proceed anonymously.
        </p>
        
        <input type="text" id="username-input" class="action-btn" style="background:#0d1117; border:1px solid #30363d; cursor:text; text-align:left; margin:0;" placeholder="Enter Username (Optional)...">
        
        <button class="action-btn" onclick="submitName(false)">Save & Continue</button>
        <button class="action-btn" style="background: #21262d; border-color: #30363d; margin-top: 8px;" onclick="submitName(true)">Play Anonymously</button>
      </div>
    `;
}

function submitName(anonymous) {
    isAnonymous = anonymous;
    const inputVal = document.getElementById('username-input').value.trim();
    playerName = isAnonymous ? "Anonymous" : (inputVal || "Player One");
    startLevel2();
}

// --- LEVEL 2: CHECKBOX HELL ---


function startLevel2() {
    const pages = [
        [
            "I am a human",
            "I am not a robot",
            "I understand the terms",
            "I accept cookies",
            "I have read the privacy policy",
            "I acknowledge the risks"
        ],
        [
            "I agree to continue",
            "I am not a computer program",
            "I confirm my identity",
            "I accept responsibility",
            "I understand this challenge",
            "I promise not to rage quit"
        ]
    ];

    let currentPage = 0;
    let timeLeft = 30;
    let ended = false;
    let checkedCount = 0;

    function renderPage() {
        if (ended) return;

        const page = pages[currentPage];

        app.innerHTML = `
      <div class="verification-panel">

        <div class="verify-header">
          <div class="verify-logo">✓</div>
          <div>
            <div class="verify-title">
              Security Verification
            </div>
            <div class="verify-subtitle">
              Chrono Quest Identity Protection
            </div>
          </div>
        </div>

        <div style="
          display:flex;
          justify-content:space-between;
          margin-top:20px;
          font-size:12px;
          color:#5f6368;
        ">
          <span>Verification Page ${currentPage + 1} of 2</span>
          <strong id="verify-time">${timeLeft.toFixed(1)}s</strong>
        </div>

        <div class="verify-progress">
          <div
            class="verify-progress-fill"
            id="verify-fill"
            style="width:${checkedCount / 12 * 100}%">
          </div>
        </div>

        <div class="verify-counter">
          <span id="verify-count">
            ${checkedCount} / 12 requirements completed
          </span>
          <span>Step ${currentPage + 1}/2</span>
        </div>

        <h3 style="
          font-size:16px;
          margin:22px 0 5px;
          color:#202124;
        ">
          ${currentPage === 0
                ? "Basic Identity Checks"
                : "Final Security Confirmation"}
        </h3>

        <p style="
          font-size:12px;
          color:#70757a;
          margin-bottom:15px;
        ">
          Check every requirement to unlock the next page.
        </p>

        <div class="verify-grid" style="grid-template-columns:1fr;">
          ${page.map((task, i) => `
            <label class="verify-item">
              <input type="checkbox" class="cb">
              <span>${task}</span>
            </label>
          `).join("")}
        </div>

        <div class="verify-status" id="verify-status">
          Complete all 6 requirements to continue.
        </div>

        <button
          id="verify-next"
          disabled
          style="
            width:100%;
            padding:12px;
            margin-top:12px;
            background:#dadce0;
            color:#80868b;
            border:0;
            border-radius:5px;
            font-weight:bold;
            cursor:not-allowed;
          ">
          ${currentPage === 0
                ? "Complete Page 1 First"
                : "Complete Verification"}
        </button>

        <div class="verify-footer">
          <span>Protected by Chrono Security</span>
          <span>Verification ID: CQ-2026</span>
        </div>

      </div>
    `;

        const checkboxes = [
            ...document.querySelectorAll(".cb")
        ];

        const fill = document.getElementById("verify-fill");
        const count = document.getElementById("verify-count");
        const status = document.getElementById("verify-status");
        const next = document.getElementById("verify-next");
        const timerText = document.getElementById("verify-time");

        function updateTimerDisplay() {
            if (timerText) {
                timerText.textContent =
                    `${Math.max(0, timeLeft).toFixed(1)}s`;
            }
        }

        updateTimerDisplay();

        checkboxes.forEach(cb => {
            cb.addEventListener("change", () => {
                const completed = checkboxes.filter(
                    checkbox => checkbox.checked
                ).length;

                const previousCompleted = checkedCount;

                checkedCount =
                    currentPage * 6 + completed;

                fill.style.width =
                    `${checkedCount / 12 * 100}%`;

                count.textContent =
                    `${checkedCount} / 12 requirements completed`;

                if (completed === 6) {
                    status.style.color = "#188038";
                    status.textContent =
                        "Page verified! You may proceed.";

                    next.disabled = false;
                    next.style.background = "#4285f4";
                    next.style.color = "#ffffff";
                    next.style.cursor = "pointer";
                    next.textContent =
                        currentPage === 0
                            ? "Next Page →"
                            : "Finish Verification ✓";
                } else {
                    status.style.color = "#5f6368";
                    status.textContent =
                        `${6 - completed} requirements remaining.`;

                    next.disabled = true;
                    next.style.background = "#dadce0";
                    next.style.color = "#80868b";
                    next.style.cursor = "not-allowed";
                    next.textContent =
                        currentPage === 0
                            ? "Complete Page 1 First"
                            : "Complete Verification";
                }
            });
        });

        next.addEventListener("click", () => {
            if (next.disabled || ended) return;

            if (currentPage === 0) {
                currentPage = 1;
                renderPage();
            } else {
                ended = true;
                clearInterval(timer);

                app.innerHTML = `
          <div class="verification-panel"
            style="text-align:center;">
            <div style="
              font-size:50px;
              color:#188038;
              margin:15px;
            ">✓</div>

            <h2 style="color:#202124;">
              Verification Successful!
            </h2>

            <p style="color:#5f6368;font-size:13px;">
              All 12 security requirements completed.
              Identity confirmed.
            </p>

            <div style="
              background:#e6f4ea;
              padding:12px;
              color:#188038;
              border-radius:6px;
              font-size:13px;
              margin-top:15px;
            ">
              ACCESS GRANTED
            </div>
          </div>
        `;

                setTimeout(startLevel3, 1500);
            }
        });
    }

    renderPage();

    const timer = setInterval(() => {
        if (ended) return;

        timeLeft -= 0.1;

        const timerText =
            document.getElementById("verify-time");

        if (timerText) {
            timerText.textContent =
                `${Math.max(0, timeLeft).toFixed(1)}s`;
        }

        if (timeLeft <= 0) {
            ended = true;
            clearInterval(timer);

            app.innerHTML = `
        <div class="verification-panel"
          style="text-align:center;">
          <div style="font-size:45px;">⏱️</div>
          <h2 style="color:#d93025;">
            Verification Timed Out!
          </h2>
          <p style="color:#5f6368;font-size:13px;">
            You took too long to complete the security checks.
            Both pages must be completed again.
          </p>
          <button
            onclick="startLevel2()"
            style="
              background:#4285f4;
              color:white;
              border:0;
              padding:12px 25px;
              border-radius:5px;
              font-weight:bold;
              cursor:pointer;
            ">
            Try Again
          </button>
        </div>
      `;
        }
    }, 100);
}



// --- LEVEL 3: LOGIN SCREEN TROLL ---
function startLevel3() {
    app.innerHTML = `
      <div class="box-container" style="width: 380px;">
        <h2 style="margin-top:0; color: #ffffff; font-size: 1.5rem; text-align: center;">Level 3: Authentication</h2>
        <p style="font-size: 0.85rem; color: #8b949e; text-align: center; margin-bottom: 20px;">Enter credentials to proceed to the portal.</p>
        
        <input type="text" class="action-btn" style="background:#0d1117; border:1px solid #30363d; cursor:text; text-align:left; margin:6px 0;" placeholder="Username" id="l3-user">
        <input type="password" class="action-btn" style="background:#0d1117; border:1px solid #30363d; cursor:text; text-align:left; margin:6px 0;" placeholder="Password" id="l3-pass">
        
        <button class="action-btn" id="login-btn">log in</button>
        <div id="l3-msg" style="color: #f85149; font-size: 0.85rem; min-height: 25px; margin-top: 10px; text-align: center;"></div>

        <div style="font-size: 0.75rem; color: #484f58; text-align: center; margin-top: 15px; line-height: 1.4;">
          By clicking or attempting entry, you acknowledge standard terms. To proceed past verification, ensure you use the exact capitalized command: <span id="secret-login-link" style="color: #484f58; cursor: pointer; transition: color 0.2s;">Log in</span> to continue.
        </div>
      </div>
    `;

    const loginBtn = document.getElementById('login-btn');
    const msg = document.getElementById('l3-msg');
    const secretLink = document.getElementById('secret-login-link');

    secretLink.addEventListener('mouseenter', () => {
        secretLink.style.color = '#58a6ff';
    });
    secretLink.addEventListener('mouseleave', () => {
        secretLink.style.color = '#484f58';
    });

    loginBtn.addEventListener('click', () => {
        msg.textContent = "Error: It said to \"Log in\", not \"log in\"!";
    });

    secretLink.addEventListener('click', () => {
        startLevel4();
    });
}

// --- LEVEL 4: DOWNLOADING MINI-GAME TRAP ---



function startLevel4() {
    app.innerHTML = `
    <div class="wild-game">
      <h2 class="wild-title">Level 4: Asset Recovery</h2>

      <p class="wild-warning">
        ⚠️ OH NO! The game file has run into the wild grass.
        Catch it to continue playing!
      </p>

      <div style="text-align:left;color:#8b949e;font-size:12px;">
        Download recovery progress
      </div>

      <div class="wild-download-bar">
        <div class="wild-download-fill" id="dl-bar"></div>
      </div>

      <div style="display:flex;justify-content:space-between;
        color:#8b949e;font-size:11px;">
        <span id="dl-status">Recovery: 0%</span>
        <span>GAME.zip</span>
      </div>

      <div class="wild-scene" id="wild-scene">
        <div class="wild-sun"></div>
        <div class="wild-cloud"></div>
        <div class="wild-hill"></div>
        <div class="wild-hill second"></div>
        <div class="wild-grass"></div>

        <div class="game-file" id="game-file">
          📦
          <span>GAME.zip</span>
        </div>
      </div>

      <div class="wild-counter" id="catch-count">
        Catches required: 1
      </div>

      <div class="wild-message" id="wild-message">
        The game.zip file is escaping! Catch it quickly!
      </div>

      <div class="wild-instruction">
        Use your net to catch the file with one click!
      </div>
    </div>
  `;

    const scene = document.getElementById("wild-scene");
    const file = document.getElementById("game-file");
    const bar = document.getElementById("dl-bar");
    const status = document.getElementById("dl-status");
    const counter = document.getElementById("catch-count");
    const message = document.getElementById("wild-message");

    let running = true;
    let moveInterval = null;
    let speedInterval = null;

    function moveFile() {
        if (!running) return;

        const maxX = scene.clientWidth - file.offsetWidth - 5;
        const maxY = scene.clientHeight - file.offsetHeight - 5;

        const x = 5 + Math.random() * Math.max(0, maxX - 5);
        const y = 5 + Math.random() * Math.max(0, maxY - 5);

        file.style.left = `${x}px`;
        file.style.top = `${y}px`;
        file.style.transform =
            `rotate(${Math.random() * 25 - 12}deg)`;
    }

    // Position the file before starting movement.
    file.style.left = "40px";
    file.style.top = "65px";

    // Give the player a fair initial opportunity.
    moveInterval = setInterval(moveFile, 500);

    speedInterval = setInterval(() => {
        if (!running) return;

        clearInterval(moveInterval);

        moveInterval = setInterval(
            moveFile,
            200 + Math.random() * 150
        );
    }, 2000);

    function catchFile(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!running) return;

        // Immediately lock the game.
        running = false;

        clearInterval(moveInterval);
        clearInterval(speedInterval);

        file.style.pointerEvents = "none";
        file.style.transition = "transform 0.2s";
        file.style.transform = "scale(1.3) rotate(0deg)";
        file.style.background = "#56d364";
        file.style.borderColor = "#ffffff";

        file.innerHTML = `✓<span>CAUGHT!</span>`;

        bar.style.width = "100%";
        status.textContent = "Recovery: 100%";

        counter.textContent = "GAME.zip SUCCESSFULLY CAPTURED!";
        counter.style.color = "#56d364";

        message.style.color = "#56d364";
        message.textContent =
            "You caught it! Download successfully restored.";

        // Continue exactly once.
        setTimeout(() => {
            startLevel5();
        }, 1500);
    }

    // Pointerdown catches immediately, without waiting for mouseup.
    file.addEventListener("pointerdown", catchFile);
}




// --- LEVEL 5: THE WAITING ROOM ---
function startLevel5() {
    app.innerHTML = `
      <div class="box-container" style="text-align: center;">
        <h2 style="color: #ffffff;">Level 5: The Waiting Room</h2>
        <p style="color: #8b949e; font-size: 0.9rem;">Patience is a virtue. Do absolutely nothing and wait for the button to appear.</p>
        <div id="delayed-btn-area" style="min-height: 60px; margin-top: 20px; color: #d29922; font-size: 0.85rem;">Waiting... (Remain still)</div>
      </div>
    `;

    let waitTime = 6;
    const waitInterval = setInterval(() => {
        waitTime--;
        if (waitTime > 0) {
            document.getElementById('delayed-btn-area').textContent = `Waiting... ${waitTime}s remaining`;
        } else {
            clearInterval(waitInterval);
            document.getElementById('delayed-btn-area').innerHTML = `<button class="action-btn" onclick="startLevel6()">Proceed to Level 6</button>`;
        }
    }, 1000);
}

// --- LEVEL 6: BUTTON SHUFFLE ---

function startLevel6() {
    app.innerHTML = `
    <div style="
      width:min(650px,92vw);
      background:#ffffff;
      color:#202124;
      border-radius:10px;
      overflow:hidden;
      box-shadow:0 12px 40px rgba(0,0,0,.5);
      font-family:Arial,sans-serif;
    ">

      <!-- Fake browser header -->
      <div style="
        background:#e8eaed;
        padding:12px 16px;
        display:flex;
        align-items:center;
        gap:7px;
      ">
        <span style="width:11px;height:11px;border-radius:50%;background:#ea4335;"></span>
        <span style="width:11px;height:11px;border-radius:50%;background:#fbbc04;"></span>
        <span style="width:11px;height:11px;border-radius:50%;background:#34a853;"></span>

        <div style="
          background:white;
          padding:7px 12px;
          border-radius:5px;
          margin-left:12px;
          flex:1;
          color:#70757a;
          font-size:12px;
        ">
          https://chronoquest.com/about
        </div>
      </div>

      <!-- Website navigation -->
      <div style="
        padding:20px 25px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        border-bottom:1px solid #eeeeee;
      ">
        <strong style="font-size:19px;color:#202124;">
          CHRONO<span style="color:#4285f4;">QUEST</span>
        </strong>

        <span style="font-size:12px;color:#70757a;">
          Home &nbsp; About &nbsp; Contact
        </span>
      </div>

      <!-- Main website content -->
      <div style="
        padding:45px 25px 65px;
        text-align:center;
      ">
        <div style="
          font-size:11px;
          color:#4285f4;
          font-weight:bold;
          letter-spacing:2px;
        ">
          WEBSITE QUALITY CONTROL
        </div>

        <h2 style="
          font-size:25px;
          color:#202124;
          margin:16px 0;
        ">
          Something isn't quite right.
        </h2>

        <p style="
          color:#5f6368;
          font-size:14px;
          line-height:1.7;
          max-width:440px;
          margin:0 auto;
        ">
          This page has a spelling mistake.
          Find it to proceed.
          <br>
          <span style="color:#9aa0a6;font-size:12px;">
            There is exactly one mistake hidden somewhere on this page.
          </span>
        </p>

        <div style="
          background:#f8f9fa;
          border:1px solid #dadce0;
          padding:18px;
          margin:30px auto 0;
          max-width:400px;
          border-radius:7px;
          font-size:13px;
          color:#5f6368;
        ">
          Welcome to Chrono Quest.

          <p style="margin-bottom:0;">
            We believe in quality, creativity and
            delivering the best experience possible.
          </p>
        </div>

      </div>

      <!-- Footer with hidden spelling mistake -->
      <div style="
        background:#f8f9fa;
        border-top:1px solid #eeeeee;
        padding:15px 20px 10px;
        text-align:center;
      ">
        <div style="font-size:11px;color:#9aa0a6;">
          Privacy Policy &nbsp; | &nbsp;
          Terms of Service &nbsp; | &nbsp;
          Support
        </div>

        <div style="
          font-size:8px;
          color:#aeb4bb;
          margin-top:13px;
          letter-spacing:.3px;
        ">
          © 2026 Chrono Quest.
          All Rights Reserverd™
          <span
            id="hidden-mistake"
            style="cursor:text;"
          ></span>
        </div>
      </div>

    </div>
  `;

    const footer = document.querySelector(
        "#hidden-mistake"
    );

    // Make the actual typo clickable without making
    // the whole footer an obvious button.
    footer.parentElement.addEventListener("click", (e) => {
        if (e.target === footer.parentElement ||
            e.target === footer) {
            startLevel7();
        }
    });
}


// --- LEVEL 7: PRECISION CLICK ---
function startLevel7() {
    app.innerHTML = `
      <div class="box-container" style="text-align: center;">
        <h2 style="color: #ffffff;">Level 7: Precision Click</h2>
        <p style="color: #8b949e; font-size: 0.9rem;">Hit the tiny target before it shrinks completely away.</p>
        <div style="position: relative; height: 120px; width: 100%;">
          <button id="tiny-target" onclick="startLevel8()" style="position: absolute; left: 45%; top: 40px; padding: 4px 8px; font-size: 0.7rem; background: #238636; color: white; border: none; border-radius: 4px; cursor: pointer;">CLICK ME</button>
        </div>
      </div>
    `;
    let size = 1;
    const t = document.getElementById('tiny-target');
    const shrink = setInterval(() => {
        size -= 0.05;
        if (size > 0.2) t.style.transform = `scale(${size})`;
        else clearInterval(shrink);
    }, 200);
}

function validatePassword() {
    const input = document.getElementById("pwd-input");
    const msg = document.getElementById("pwd-msg");
    const button = document.getElementById("pwd-submit");

    if (!input || !msg || !button) return;

    if (input.value === "*****") {
        button.disabled = true;
        button.textContent = "ACCESS GRANTED!";
        button.style.background = "#238636";

        msg.style.color = "#56d364";
        msg.textContent = "Correct! Loading next level...";

        setTimeout(() => {
            startLevel9();
        }, 1000);

    } else {
        msg.style.color = "#f85149";
        msg.textContent =
            "Incorrect password! Look closely at the displayed text.";

        input.value = "";
        input.focus();
    }
}


// --- LEVEL 8: PASSWORD STRENGTH LOGIC TRAP ---

function startLevel8() {
    app.innerHTML = `
    <div class="box-container" style="
      text-align:center;
      width:400px;
      max-width:90vw;
      box-sizing:border-box;
    ">
      <h2 style="color:#ffffff;">
        Level 8: Password Logic
      </h2>

      <p style="
        font-size:0.85rem;
        color:#8b949e;
        line-height:1.6;
      ">
        Guess the correct password displayed below.
        Input must match identically.
      </p>

      <div style="
        font-size:2.5rem;
        font-family:monospace;
        letter-spacing:6px;
        color:#58a6ff;
        margin:20px 0;
        background:#0d1117;
        border:1px solid #30363d;
        padding:15px;
        border-radius:8px;
      ">
        *****
      </div>

      <input
        type="text"
        id="pwd-input"
        placeholder="Type password here..."
        autocomplete="off"
        style="
          width:100%;
          box-sizing:border-box;
          padding:13px;
          background:#0d1117;
          color:white;
          border:1px solid #30363d;
          border-radius:6px;
          outline:none;
        "
      >

      <button
        class="action-btn"
        id="pwd-submit"
      >
        Submit Password
      </button>

      <div id="pwd-msg" style="
        color:#f85149;
        font-size:0.85rem;
        min-height:25px;
        margin-top:12px;
      "></div>
    </div>
  `;

    const input = document.getElementById("pwd-input");
    const button = document.getElementById("pwd-submit");
    const msg = document.getElementById("pwd-msg");

    button.addEventListener("click", validatePassword);

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            validatePassword();
        }
    });

    input.focus();
}


function startLevel9() {
    app.innerHTML = `
    <div class="box-container" style="
      width:420px;
      text-align:center;
      position:relative;
    ">

      <div style="
        color:#8b949e;
        font-size:10px;
        letter-spacing:3px;
        margin-bottom:15px;
      ">
        CHRONO QUEST // FINAL STAGE
      </div>

      <h1 style="
        font-size:2rem;
        color:#ffffff;
        margin-bottom:15px;
      ">
        DON'T CLICK HERE!!
      </h1>

      <div style="
        width:100%;
        height:1px;
        background:#30363d;
        margin:10px 0 20px;
      "></div>

      <div style="
        background:#0d1117;
        border:1px solid #30363d;
        padding:25px 15px;
        border-radius:8px;
      ">

        <div style="font-size:35px;margin-bottom:12px;">
          🏁
        </div>

        <h2 style="
          color:#ffffff;
          font-size:19px;
          margin:0 0 10px;
        ">
          Almost at the finish line.
        </h2>

        <p style="
          color:#8b949e;
          font-size:13px;
          line-height:1.6;
        ">
          You've made it through everything.
          Just one final step remains.
        </p>

        <h3
          id="level9-subheader"
          style="
            color:#8b949e;
            font-size:13px;
            font-weight:400;
            margin-top:25px;
            cursor:default;
            transition:color .2s;
          "
        >
          Final checkpoint: Complete
        </h3>

        <div id="level9-response"></div>

      </div>

      <div style="
        margin-top:20px;
        color:#484f58;
        font-size:10px;
      ">
        CHRONO QUEST SECURITY SYSTEM © 2026
      </div>

    </div>
  `;

    const trigger = document.getElementById("level9-subheader");
    const response = document.getElementById("level9-response");

    let revealed = false;

    trigger.addEventListener("mouseenter", () => {
        if (revealed) return;

        trigger.textContent = "Don't click here!!";
        trigger.style.color = "#f85149";
        trigger.style.cursor = "pointer";
    });

    trigger.addEventListener("mouseleave", () => {
        if (revealed) return;

        trigger.textContent = "Final checkpoint: Complete";
        trigger.style.color = "#8b949e";
        trigger.style.cursor = "default";
    });

    trigger.addEventListener("click", () => {
        if (revealed) return;

        revealed = true;

        trigger.style.display = "none";

        response.innerHTML = `
      <div style="
        margin-top:22px;
        animation:fadeIn .4s ease;
      ">
        <h2 style="
          color:#f85149;
          font-size:20px;
          margin-bottom:8px;
        ">
          Why didn't you listen? Ugh.
        </h2>

        <p style="
          color:#8b949e;
          font-size:12px;
          margin-bottom:18px;
        ">
          I literally told you not to click it.
          Anyway, whatever. You're almost done.
        </p>

        <button
          id="level9-proceed"
          class="action-btn"
          style="margin-top:5px;"
        >
          Proceed →
        </button>
      </div>
    `;

        document.getElementById("level9-proceed")
            .addEventListener("click", () => {
                startLevel10();
            });
    });
}




// --- LEVEL 10: THE FAKE 404 WIN SCREEN ---
function startLevel10() {
    finalRunTime = ((performance.now() - totalRunStartTime) / 1000).toFixed(1);

    // Save run if not anonymous
    if (!isAnonymous) {
        let savedRuns = JSON.parse(localStorage.getItem('chrono_runs') || '[]');
        savedRuns.push({ name: playerName, time: parseFloat(finalRunTime), dodges: dodgeCount });
        localStorage.setItem('chrono_runs', JSON.stringify(savedRuns));
    }

    app.innerHTML = `
      <div class="browser-error">
        <h2>This site can’t be reached</h2>
        <p><strong>chronoquest-game-server.internal</strong> took too long to respond.</p>
        <p>Try:</p>
        <ul style="color: #5f6368; font-size: 0.9rem; line-height: 1.6; margin-left: 20px;">
          <li>Checking the connection</li>
          <li>Checking proxy and firewall</li>
          <li>Re-evaluating your life choices</li>
        </ul>
        <button onclick="location.reload()" style="margin-top: 30px; padding: 8px 16px; background: #1a73e8; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Reload</button>
        
        <div class="winning-micro" onclick="startWinScreen()">you won</div>
      </div>
    `;
}

// --- ACTUAL WIN & STATS SCREEN ---
function startWinScreen() {
    let benchmarkHtml = "";
    if (!isAnonymous) {
        let savedRuns = JSON.parse(localStorage.getItem('chrono_runs') || '[]');
        let totalRuns = savedRuns.length;
        let avgTime = totalRuns > 0 ? (savedRuns.reduce((acc, r) => acc + r.time, 0) / totalRuns).toFixed(1) : finalRunTime;

        benchmarkHtml = `
        <div style="margin-top: 15px; font-size: 0.9rem; color: #8b949e; border-top: 1px solid #30363d; padding-top: 12px; width: 100%; text-align: left;">
          <p style="margin: 4px 0;">📊 <strong>Stored Leaderboard Benchmark:</strong></p>
          <p style="margin: 4px 0;">Total Recorded Runs: ${totalRuns}</p>
          <p style="margin: 4px 0;">Global Average Completion Time: ${avgTime}s</p>
        </div>
      `;
    } else {
        benchmarkHtml = `
        <div style="margin-top: 15px; font-size: 0.85rem; color: #484f58; border-top: 1px solid #30363d; padding-top: 12px; width: 100%; text-align: center;">
          <em>Played Anonymously: Stats were recorded for this session only and were not stored for benchmarks.</em>
        </div>
      `;
    }

    app.innerHTML = `
      <div class="box-container" style="width: 420px; text-align: center;">
        <h1 style="color: #238636; font-size: 2.5rem; margin-bottom: 5px;">VICTORY</h1>
        <p style="font-size: 1rem; color: #c9d1d9; margin-bottom: 20px;">You survived the ultimate ragebait gauntlet.</p>
        
        <div style="background: #0d1117; border: 1px solid #30363d; border-radius: 6px; padding: 15px; width: 100%; box-sizing: border-box; text-align: left; margin-bottom: 15px;">
          <p style="margin: 6px 0;">👤 <strong>Player:</strong> ${playerName}</p>
          <p style="margin: 6px 0;">⏱️ <strong>Total Completion Time:</strong> ${finalRunTime} seconds</p>
          <p style="margin: 6px 0;">🏃 <strong>Level 1 Dodges Evaded:</strong> ${dodgeCount} dodges</p>
        </div>

        ${benchmarkHtml}

        <button class="action-btn" onclick="location.reload()" style="margin-top: 20px;">Play Again</button>
      </div>
    `;
}
