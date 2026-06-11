let socket;
let playerName;
let roomId;
let isHost = false;

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    const joinBtn = document.getElementById('joinBtn');
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            playerName = document.getElementById('playerName').value.trim();
            roomId = parseInt(document.getElementById('roomSelect').value);
            
            if (!playerName) {
                showMessage('Please enter your name', 'error');
                return;
            }
            
            window.location.href = `/room/${roomId}?name=${encodeURIComponent(playerName)}`;
        });
    }

    if (document.getElementById('buzzer')) {
        initializeRoom();
    }
});

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function initializeRoom() {
    const pathParts = window.location.pathname.split('/');
    roomId = parseInt(pathParts[pathParts.length - 1]);
    const urlParams = new URLSearchParams(window.location.search);
    playerName = urlParams.get('name');
    
    socket = io({
        transports: ['websocket'],
        upgrade: false
    });

    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('join', {
            room_id: roomId,
            player_name: playerName
        });
    });

    socket.on('room_update', (data) => {
        console.log('Room update:', data);
        updatePlayerList(data.players);
        updateBuzzerState(data.buzz_state);
        isHost = data.is_host;
    });

    socket.on('buzz_activated', (data) => {
        updateBuzzerState({active: true, buzzer: data.buzzer});
        showMessage(`${data.buzzer} buzzed first!`, 'success');
    });

    socket.on('buzz_reset', () => {
        updateBuzzerState({active: false, buzzer: null});
        showMessage('Buzzer has been reset', 'info');
    });

    socket.on('player_left', (data) => {
        updatePlayerList(data.remaining_players);
        showMessage(`${data.player_name} left the room`, 'info');
    });

    socket.on('you_were_kicked', () => {
        showMessage('You were kicked from the room', 'error');
        setTimeout(() => window.location.href = '/', 2000);
    });

    const buzzer = document.getElementById('buzzer');
    if (buzzer) {
        buzzer.addEventListener('click', () => {
            if (!buzzer.disabled) {
                socket.emit('buzz', {
                    room_id: roomId,
                    player_name: playerName
                });
            }
        });
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            socket.emit('reset_buzz', {
                room_id: roomId
            });
        });
    }

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/';
        });
    }
}

function updatePlayerList(players) {
    const playersList = document.getElementById('players');
    const roomStatus = document.getElementById('roomStatus');
    
    if (!playersList || !roomStatus) return;
    
    playersList.innerHTML = '';
    
    if (players.length === 0) {
        roomStatus.textContent = "Waiting for players...";
    } else {
        roomStatus.textContent = `${players.length} player${players.length !== 1 ? 's' : ''} in room`;
        
        players.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = 'player-item';
            li.innerHTML = `
                <span class="player-name ${player === playerName ? 'you' : ''}">
                    ${player} ${index === 0 ? '👑' : ''}
                </span>
                ${isHost && index > 0 ? 
                  `<button class="kick-btn" data-player="${player}">Kick</button>` : ''}
            `;
            playersList.appendChild(li);

            if (isHost && index > 0) {
                li.querySelector('.kick-btn').addEventListener('click', (e) => {
                    socket.emit('kick_player', {
                        room_id: roomId,
                        player_name: e.target.dataset.player
                    });
                });
            }
        });
    }
}

function updateBuzzerState(state) {
    const buzzer = document.getElementById('buzzer');
    const resetBtn = document.getElementById('resetBtn');
    const buzzerName = document.getElementById('buzzerName');
    
    if (buzzer) {
        buzzer.disabled = state.active;
        buzzer.classList.toggle('locked', state.active);
        buzzer.textContent = state.active ? "LOCKED" : "BUZZ!";
    }
    
    if (resetBtn) {
        resetBtn.style.display = state.active ? 'block' : 'none';
    }
    
    if (buzzerName) {
        buzzerName.textContent = state.active ? 
            `${state.buzzer} buzzed!` : 'Waiting for buzz...';
    }
}

function showMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}