const events = [
    { type: 'high', desc: 'DDoS attempt blocked from 185.15.2.x', time: 'Just now' },
    { type: 'medium', desc: 'Anomalous login behavior detected (User: j.smith)', time: '2m ago' },
    { type: 'low', desc: 'Routine firewall rules updated automatically', time: '5m ago' },
    { type: 'high', desc: 'Malware payload intercepted on endpoints', time: '12m ago' },
];

const eventList = document.getElementById('eventList');

function renderEvents() {
    eventList.innerHTML = '';
    events.slice(0, 4).forEach(event => {
        const li = document.createElement('li');
        li.className = `event-item ${event.type}`;
        li.innerHTML = `
            <div class="event-header">
                <span style="text-transform: uppercase; font-weight: 600; color: ${getColor(event.type)}">${event.type} SEVERITY</span>
                <span>${event.time}</span>
            </div>
            <div class="event-desc">${event.desc}</div>
        `;
        eventList.appendChild(li);
    });
}

function getColor(type) {
    if(type === 'high') return 'var(--neon-red)';
    if(type === 'medium') return '#F59E0B';
    return 'var(--neon-blue)';
}

renderEvents();

// Simulate live incoming events via Backend Polling
async function fetchLatestAlerts() {
    try {
        const response = await fetch('/api/threats/alerts');
        if (!response.ok) return;
        const data = await response.json();
        
        events.length = 0; // Clear array
        const alertsTableBody = document.getElementById('alerts-table-body');
        if (alertsTableBody) alertsTableBody.innerHTML = ''; // Clear table
        
        data.alerts.forEach((alert, index) => {
            // Add to Dashboard live feed
            events.push({
                type: alert.severity,
                desc: `${alert.vector} (${alert.ip})`,
                time: alert.time
            });
            
            // Build Table Row
            if (alertsTableBody) {
                let sevColor = '#10B981';
                if (alert.severity === 'critical') sevColor = 'var(--neon-red)';
                if (alert.severity === 'high') sevColor = '#F59E0B';
                if (alert.severity === 'medium') sevColor = 'var(--neon-blue)';
                
                let statText = '<i class="fa-solid fa-shield"></i> Blocked';
                let statColor = '#10B981';
                if (alert.severity === 'critical') {
                    statText = '<i class="fa-solid fa-triangle-exclamation"></i> Investigating';
                    statColor = 'var(--neon-red)';
                }
                
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                tr.style.transition = 'background 0.2s';
                tr.style.cursor = 'pointer';
                tr.onmouseover = () => tr.style.background = 'rgba(255,255,255,0.05)';
                tr.onmouseout = () => tr.style.background = 'transparent';
                
                tr.innerHTML = `
                    <td style="padding: 1rem;">${alert.time}</td>
                    <td style="padding: 1rem; color: ${sevColor}; font-weight: bold; text-transform: capitalize;">${alert.severity}</td>
                    <td style="padding: 1rem;">${alert.vector}</td>
                    <td style="padding: 1rem;">${alert.ip}</td>
                    <td style="padding: 1rem;">${alert.severity === 'critical' ? 'AWS-EU-West' : 'Firewall-Edge-1'}</td>
                    <td style="padding: 1rem; color: ${statColor};">${statText}</td>
                `;
                alertsTableBody.appendChild(tr);
            }
        });
        renderEvents();
    } catch (e) {
        console.log("Waiting for backend API...");
    }
}

// Fetch on load, then poll every 10 seconds
fetchLatestAlerts();
setInterval(fetchLatestAlerts, 10000);

// Initialize Chart.js Network Traffic Chart
const ctx = document.getElementById('trafficChart').getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 200);
gradient.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');

const trafficChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array.from({length: 20}, (_, i) => i),
        datasets: [{
            label: 'Network Traffic (Gbps)',
            data: Array.from({length: 20}, () => Math.random() * 50 + 20),
            borderColor: '#00F0FF',
            backgroundColor: gradient,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
        },
        scales: {
            x: { display: false },
            y: {
                display: true,
                grid: { color: 'rgba(255,255,255,0.05)' },
                ticks: { color: '#94A3B8' }
            }
        },
        animation: {
            duration: 0
        }
    }
});

// Simulate live chart updates
setInterval(() => {
    const data = trafficChart.data.datasets[0].data;
    data.push(Math.random() * 50 + 20); // Add new data point
    data.shift(); // Remove oldest data point
    trafficChart.update();
}, 1000);

// Navigation SPA logic
const navItems = document.querySelectorAll('#sidebarNav li');
const views = document.querySelectorAll('.view-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all nav items
        navItems.forEach(nav => nav.classList.remove('active'));
        // Add active class to clicked item
        item.classList.add('active');

        // Hide all views
        views.forEach(view => view.style.display = 'none');
        
        // Show target view
        const targetId = item.getAttribute('data-target');
        const targetView = document.getElementById(targetId);
        if (targetView) {
            targetView.style.display = 'block';
        }
    });
});

// --- Interactivity & Toasts ---

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.style.background = type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(255, 51, 102, 0.9)';
    toast.style.color = 'white';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    toast.style.fontSize = '0.9rem';
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    toast.style.transition = 'all 0.3s ease';
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check' : 'triangle-exclamation'}"></i> &nbsp; ${message}`;
    
    container.appendChild(toast);
    
    // Slide in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Attach click to all action buttons
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const text = e.target.innerText.trim();
        if (text === 'Isolate Network Segment') {
            showToast('Network segment isolated successfully.', 'success');
        } else if (text === 'Force Model Retrain') {
            showToast('Model retraining sequence initiated on GPU clusters.', 'success');
        } else if (text === 'Save Configurations') {
            showToast('Configuration rules saved securely.', 'success');
        } else if (text === 'Export CSV') {
            showToast('CSV Export started. Check your downloads.', 'success');
        } else if (text === 'Acknowledge All') {
            showToast('All active alerts acknowledged.', 'success');
        } else {
            showToast('Action executed.', 'success');
        }
    });
});

// Attach click to all Settings toggles
document.querySelectorAll('.config-toggle').forEach((toggle, index) => {
    // Map toggles to backend keys
    const keys = ["auto_ban", "ai_quarantine", "geo_blocking"];
    const configKey = keys[index];

    toggle.addEventListener('click', async () => {
        const knob = toggle.querySelector('.toggle-knob');
        const isCurrentlyOn = toggle.classList.contains('on');
        const newState = !isCurrentlyOn;
        
        try {
            const res = await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: configKey, value: newState })
            });
            
            if (!res.ok) throw new Error('Backend Sync Failed');

            if (isCurrentlyOn) {
                // Turn off
                toggle.classList.remove('on');
                toggle.classList.add('off');
                toggle.style.background = 'var(--card-bg)';
                toggle.style.borderColor = 'var(--border-color)';
                knob.style.background = 'var(--text-muted)';
                knob.style.right = 'auto';
                knob.style.left = '2px';
                showToast(`Backend Synced: ${configKey} disabled.`, 'success');
            } else {
                // Turn on
                toggle.classList.remove('off');
                toggle.classList.add('on');
                toggle.style.background = '#10B981';
                toggle.style.borderColor = 'transparent';
                knob.style.background = 'white';
                knob.style.left = 'auto';
                knob.style.right = '2px';
                showToast(`Backend Synced: ${configKey} enabled.`, 'success');
            }
        } catch (error) {
            showToast('Failed to sync configuration to backend.', 'error');
        }
    });
});

// ====== MODAL SYSTEM ======
const modal = document.getElementById('global-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const modalActions = document.getElementById('modal-actions');
const modalClose = document.getElementById('modal-close');

function openModal(title, contentHTML, actionsHTML = '') {
    modalTitle.innerHTML = title;
    modalContent.innerHTML = contentHTML;
    modalActions.innerHTML = actionsHTML;
    modal.style.display = 'flex';
    
    // Attach click to any new action buttons inside modal
    modalActions.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const txt = e.target.innerText;
            if (txt !== 'Dismiss') {
                showToast(txt + ' executed successfully.', 'success');
            }
            closeModal();
        });
    });
}

function closeModal() {
    modal.style.display = 'none';
}

if (modalClose) {
    modalClose.addEventListener('click', closeModal);
}

// ====== SEARCH LOGIC ======
const searchInput = document.getElementById('global-search');
if (searchInput) {
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                showToast(`Querying API for: ${query}...`, 'success');
                
                try {
                    // Call the Python Backend API
                    const response = await fetch(`/api/threats/search?query=${encodeURIComponent(query)}`);
                    if (!response.ok) throw new Error('API Error');
                    
                    const data = await response.json();
                    
                    const color = data.status === 'CRITICAL THREAT' ? 'var(--neon-red)' : '#10B981';
                    
                    const content = `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span>Query:</span> <strong style="color: white;">${data.query}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span>Reputation:</span> <strong style="color: ${color};">${data.status}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                            <span>Geo-Location:</span> <strong style="color: white;">${data.geo}</strong>
                        </div>
                        <p style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px;">
                            ${data.details}
                        </p>
                    `;
                    
                    const actions = data.status === 'CRITICAL THREAT'
                        ? `<button class="action-btn" style="background: rgba(255, 51, 102, 0.1); border-color: var(--neon-red); color: var(--neon-red);">Quarantine Target</button>`
                        : `<button class="action-btn" style="background: transparent; border-color: var(--text-muted); color: var(--text-muted);" onclick="document.getElementById('global-modal').style.display='none'">Dismiss</button>`;
                        
                    openModal(`<i class="fa-solid fa-magnifying-glass"></i> API Search Results`, content, actions);
                    searchInput.value = '';
                } catch (error) {
                    showToast('Failed to connect to backend API.', 'error');
                }
            }
        }
    });
}

// ====== GLOBAL THREAT MAP LOGIC ======
function spawnBlip() {
    const radarContainers = document.querySelectorAll('.radar');
    radarContainers.forEach(radar => {
        const blip = document.createElement('div');
        const isCritical = Math.random() > 0.7;
        blip.className = `blip ${isCritical ? 'critical' : ''}`;
        
        // Random position
        blip.style.top = Math.floor(Math.random() * 90 + 5) + '%';
        blip.style.left = Math.floor(Math.random() * 90 + 5) + '%';
        blip.style.cursor = 'pointer';
        
        // Make blip clickable
        blip.addEventListener('click', (e) => {
            e.stopPropagation();
            const ip = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.x`;
            const content = `
                <p><strong>Incident Vector:</strong> ${isCritical ? 'Zero-Day Payload Attempt' : 'Automated Port Scan'}</p>
                <p><strong>Source IP:</strong> ${ip}</p>
                <p><strong>Status:</strong> ${isCritical ? '<span style="color:var(--neon-red)">CRITICAL ALERT</span>' : '<span style="color:#10B981">BLOCKED</span>'}</p>
                <p style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px;">
                    This geographic node just registered an active intrusion attempt against the external load balancer.
                </p>
            `;
            const actions = `
                <button class="action-btn" style="width: auto;">Trace Route</button>
                <button class="action-btn" style="width: auto; background: rgba(255, 51, 102, 0.1); border-color: var(--neon-red); color: var(--neon-red);" onclick="
                    document.getElementById('modal-close').click();
                    document.querySelectorAll('#sidebarNav li').forEach(nav => nav.classList.remove('active'));
                    document.querySelector('[data-target=\\'view-ai\\']').classList.add('active');
                    document.querySelectorAll('.view-section').forEach(view => view.style.display = 'none');
                    document.getElementById('view-ai').style.display = 'block';
                    setTimeout(() => showToast('Mitigation handover to AI Engine successful.', 'success'), 300);
                ">Deploy Countermeasures</button>
            `;
            openModal(`<i class="fa-solid fa-satellite-dish"></i> Geospatial Intercept`, content, actions);
        });
        
        radar.appendChild(blip);
        
        // Remove blip after animation (4s)
        setTimeout(() => {
            if (blip.parentElement) {
                blip.remove();
            }
        }, 4000);
    });
}

// Spawn a blip every 1.5 seconds
setInterval(spawnBlip, 1500);

// ====== ALERT ROW CLICKS ======
document.querySelectorAll('#view-alerts tr').forEach((row, index) => {
    if (index === 0) return; // Skip header
    row.addEventListener('click', () => {
        const time = row.cells[0].innerText;
        const severity = row.cells[1].innerText;
        const vector = row.cells[2].innerText;
        const ip = row.cells[3].innerText;
        
        const content = `
            <p><strong>Incident Vector:</strong> ${vector}</p>
            <p><strong>Source IP:</strong> ${ip}</p>
            <p><strong>Timestamp:</strong> ${time}</p>
            <p style="margin-top: 1rem; padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px;">
                Payload signature matched known CVE databases. Automated mitigation rules were instantly triggered, dropping all packets from this source across the edge firewall.
            </p>
        `;
        const actions = `
            <button class="action-btn" style="width: auto;">View PCAP Data</button>
            <button class="action-btn" style="width: auto; background: rgba(255, 51, 102, 0.1); border-color: var(--neon-red); color: var(--neon-red);">Ban Subnet</button>
        `;
        openModal(`<i class="fa-solid fa-file-shield"></i> Incident Details`, content, actions);
    });
});

// ====== TOPBAR CLICKS ======
const adminAvatar = document.getElementById('admin-avatar');
const profileDropdown = document.getElementById('profile-dropdown');

if (adminAvatar && profileDropdown) {
    adminAvatar.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent trigger of parent
        // Toggle dropdown
        if (profileDropdown.style.display === 'none') {
            profileDropdown.style.display = 'block';
        } else {
            profileDropdown.style.display = 'none';
        }
    });
    
    // Hide dropdown when clicking anywhere else
    document.addEventListener('click', (e) => {
        if (e.target !== adminAvatar && !profileDropdown.contains(e.target)) {
            profileDropdown.style.display = 'none';
        }
    });
    
    // Dropdown options
    document.getElementById('dropdown-settings').addEventListener('click', () => {
        profileDropdown.style.display = 'none';
        document.querySelectorAll('#sidebarNav li').forEach(nav => nav.classList.remove('active'));
        document.querySelector('[data-target="view-settings"]').classList.add('active');
        document.querySelectorAll('.view-section').forEach(view => view.style.display = 'none');
        document.getElementById('view-settings').style.display = 'block';
        showToast('Navigated to Admin Settings.', 'success');
    });
    
    document.getElementById('dropdown-logout').addEventListener('click', () => {
        profileDropdown.style.display = 'none';
        showToast('Session terminated.', 'success');
        
        // Show login screen again
        const loginScreen = document.getElementById('login-screen');
        if (loginScreen) {
            loginScreen.style.display = 'flex';
            setTimeout(() => {
                loginScreen.style.opacity = '1';
                loginScreen.style.transform = 'scale(1)';
            }, 50);
        }
    });
}

const statusIndicator = document.getElementById('status-indicator');
if (statusIndicator) {
    statusIndicator.addEventListener('click', () => {
        const content = `
            <div style="display: flex; flex-direction: column; gap: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10B981; border-radius: 4px;">
                    <span style="color: white;"><i class="fa-solid fa-server"></i> Main API Gateway</span>
                    <span style="color: #10B981;">12ms latency</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10B981; border-radius: 4px;">
                    <span style="color: white;"><i class="fa-solid fa-database"></i> Elastic Search Cluster</span>
                    <span style="color: #10B981;">Nominal Load</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-left: 3px solid #10B981; border-radius: 4px;">
                    <span style="color: white;"><i class="fa-solid fa-microchip"></i> AI Heuristics Node</span>
                    <span style="color: #10B981;">Fully Synced</span>
                </div>
            </div>
        `;
        const actions = `<button class="action-btn" style="background: transparent; border-color: var(--text-muted); color: var(--text-muted);" onclick="closeModal()">Close</button>`;
        openModal(`<i class="fa-solid fa-heart-pulse"></i> System Health Report`, content, actions);
    });
}

// ====== LOGIN LOGIC ======
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const toggleAuthBtn = document.getElementById('toggle-auth-btn');
const toggleAuthText = document.getElementById('toggle-auth-text');
const nameField = document.getElementById('name-field');
const loginName = document.getElementById('login-name');
const btnText = document.getElementById('btn-text');

let isSignupMode = false;

if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isSignupMode = !isSignupMode;
        
        if (isSignupMode) {
            nameField.style.display = 'block';
            loginName.setAttribute('required', 'true');
            btnText.innerText = 'Register Account';
            toggleAuthText.innerText = 'Already have an account?';
            toggleAuthBtn.innerText = 'Log In';
        } else {
            nameField.style.display = 'none';
            loginName.removeAttribute('required');
            btnText.innerText = 'Initialize Session';
            toggleAuthText.innerText = "Don't have an account?";
            toggleAuthBtn.innerText = 'Create Account';
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        const emailInput = document.getElementById('login-email').value.trim();
        const passInput = document.getElementById('login-pass').value.trim();
        const nameInput = document.getElementById('login-name').value.trim();
        
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.7';
        
        setTimeout(async () => {
            try {
                let endpoint = '/api/auth/login';
                let bodyData = { email: emailInput, password: passInput };
                
                if (isSignupMode) {
                    endpoint = '/api/auth/signup';
                    bodyData.name = nameInput;
                }

                // Call the real Python Backend API
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bodyData)
                });

                if (!response.ok) {
                    const errData = await response.json().catch(()=>({}));
                    throw new Error(errData.detail || 'Invalid Credentials');
                }

                const data = await response.json();
                
                // Success Path (Token Received)
                if (isSignupMode) {
                    showToast(`Registration Successful! Welcome ${data.user}.`, 'success');
                } else {
                    showToast(`Authentication Successful. Welcome ${data.user}.`, 'success');
                }
                
                // Update avatar initials if not Admin
                const avatar = document.getElementById('admin-avatar');
                if (avatar) avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.user)}&background=0D8ABC&color=fff`;

                loginScreen.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
                loginScreen.style.opacity = '0';
                loginScreen.style.transform = 'scale(1.05)';
                
                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    // Reset form in case they log out later
                    btn.innerHTML = originalText;
                    btn.style.pointerEvents = 'auto';
                    btn.style.opacity = '1';
                    document.getElementById('login-email').value = '';
                    document.getElementById('login-pass').value = '';
                    document.getElementById('login-name').value = '';
                }, 800);

            } catch (error) {
                // Failure Path
                showToast(`Authentication Failed: ${error.message}`, 'error');
                btn.innerHTML = originalText;
                btn.style.pointerEvents = 'auto';
                btn.style.opacity = '1';
                
                // Shake effect
                const card = loginScreen.querySelector('.card');
                if (card) {
                    card.animate([
                        { transform: 'translateX(0)' },
                        { transform: 'translateX(-10px)' },
                        { transform: 'translateX(10px)' },
                        { transform: 'translateX(-10px)' },
                        { transform: 'translateX(10px)' },
                        { transform: 'translateX(0)' }
                    ], { duration: 400 });
                }
            }
        }, 500); // Small 0.5s visual delay before hitting API
    });
}

// ====== AI COPILOT WIDGET ======
const aiChatBtn = document.getElementById('ai-chat-btn');
const aiChatWindow = document.getElementById('ai-chat-window');
const aiChatClose = document.getElementById('ai-chat-close');
const aiChatInput = document.getElementById('ai-chat-input');
const aiChatSend = document.getElementById('ai-chat-send');
const aiChatMessages = document.getElementById('ai-chat-messages');

if (aiChatBtn) {
    aiChatBtn.addEventListener('click', () => {
        aiChatWindow.style.display = aiChatWindow.style.display === 'none' ? 'flex' : 'none';
    });
    
    aiChatClose.addEventListener('click', () => {
        aiChatWindow.style.display = 'none';
    });
    
    const sendAIMessage = (text, isUser = false) => {
        const msg = document.createElement('div');
        msg.style.padding = '0.8rem';
        msg.style.borderRadius = '8px';
        msg.style.maxWidth = '80%';
        msg.style.fontSize = '0.9rem';
        msg.style.lineHeight = '1.4';
        
        if (isUser) {
            msg.style.background = 'rgba(0, 240, 255, 0.1)';
            msg.style.border = '1px solid var(--neon-blue)';
            msg.style.color = 'white';
            msg.style.alignSelf = 'flex-end';
        } else {
            msg.style.background = 'rgba(255,255,255,0.05)';
            msg.style.color = 'var(--text-muted)';
            msg.style.alignSelf = 'flex-start';
        }
        
        msg.innerText = text;
        aiChatMessages.appendChild(msg);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
    };
    
    const processAICommand = (text) => {
        const lower = text.toLowerCase();
        setTimeout(() => {
            if (lower.includes('isolate') || lower.includes('block') || lower.includes('ban')) {
                sendAIMessage("Executing automated protocol. I have isolated the requested network segments and updated edge firewalls.", false);
                showToast("AI Copilot isolated network segment.", "success");
            } else if (lower.includes('status') || lower.includes('report')) {
                sendAIMessage("Current Threat Level is nominal. We mitigated 3 DDoS attempts in the past hour. Systems are secure.", false);
            } else {
                sendAIMessage("I am currently operating in limited preview mode. I have logged your request for analysis and queued it for the next heuristic update.", false);
            }
        }, 1000);
    };
    
    const handleSend = () => {
        const text = aiChatInput.value.trim();
        if (text) {
            sendAIMessage(text, true);
            aiChatInput.value = '';
            
            // Show typing indicator
            const typing = document.createElement('div');
            typing.id = 'ai-typing';
            typing.style.color = 'var(--neon-purple)';
            typing.style.alignSelf = 'flex-start';
            typing.style.fontSize = '0.8rem';
            typing.style.marginTop = '0.5rem';
            typing.innerText = 'AI is analyzing...';
            aiChatMessages.appendChild(typing);
            
            setTimeout(() => {
                const t = document.getElementById('ai-typing');
                if (t) t.remove();
                processAICommand(text);
            }, 1000);
        }
    };
    
    aiChatSend.addEventListener('click', handleSend);
    aiChatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
}

// ====== AI NEURAL TERMINAL ======
const aiTerminal = document.getElementById('ai-terminal');
const terminalLogs = [
    "[+] Analyzing packet header 0x0A...",
    "[+] Synaptic weights adjusted...",
    "[-] Dropping malformed request...",
    "[!] Warning: Anomalous payload signature detected.",
    "[+] Running DeepHeuristics(TM) scan...",
    "[+] Clean. Confidence: 99.1%",
    "[+] Cross-referencing Threat Intel...",
    "[-] Node latency spike detected and smoothed.",
    "[+] Ingesting honeypot traffic logs...",
    "[+] Retraining anomaly model... Done.",
    "[!] Alert: Suspicious outbound port bind blocked."
];

setInterval(() => {
    if (aiTerminal && document.getElementById('view-ai').style.display === 'block') {
        const line = document.createElement('div');
        const text = terminalLogs[Math.floor(Math.random() * terminalLogs.length)];
        
        if (text.includes('[!]')) {
            line.style.color = 'var(--neon-red)';
        } else if (text.includes('[-]')) {
            line.style.color = 'var(--neon-blue)';
        }
        
        line.innerText = `> ${new Date().toISOString().split('T')[1].substring(0, 8)} ${text}`;
        aiTerminal.appendChild(line);
        
        if (aiTerminal.children.length > 12) {
            aiTerminal.removeChild(aiTerminal.children[0]);
        }
    }
}, 800);





