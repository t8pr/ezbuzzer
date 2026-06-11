from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from collections import defaultdict
import os
from Crypto.Cipher import AES
from datetime import datetime, timedelta
from io import BytesIO

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
socketio = SocketIO(app, cors_allowed_origins="*")

rooms = defaultdict(list)
players = {} 
buzz_state = defaultdict(lambda: {'active': False, 'buzzer': None})
MAX_ROOMS = 10

@app.route('/')
def index():
    return render_template('index.html', max_rooms=MAX_ROOMS)

@app.route('/room/<int:room_id>')
def room(room_id):
    if room_id < 1 or room_id > MAX_ROOMS:
        return "Invalid room number", 404
    return render_template('room.html', room_id=room_id)

@app.route('/connect')
def handle_connect():
    print(f"Client connected: {request.sid}")

@app.route('/join')
def handle_join(data):
    room_id = data['room_id']
    player_name = data['player_name']
    
    if player_name not in rooms[room_id]:
        rooms[room_id].append(player_name)
        players[request.sid] = {'name': player_name, 'room': room_id}
        join_room(room_id)
        
        emit('room_update', {
            'players': rooms[room_id],
            'buzz_state': buzz_state[room_id],
            'is_host': rooms[room_id][0] == player_name
        }, room=room_id)

@app.route('/buzz')
def handle_buzz(data):
    room_id = data['room_id']
    player_name = data['player_name']
    
    if not buzz_state[room_id]['active']:
        buzz_state[room_id] = {'active': True, 'buzzer': player_name}
        emit('buzz_activated', {
            'buzzer': player_name
        }, room=room_id)

@app.route('/reset_buzz')
def handle_reset_buzz(data):
    room_id = data['room_id']
    buzz_state[room_id] = {'active': False, 'buzzer': None}
    emit('buzz_reset', {}, room=room_id)

@app.route('/kick_player')
def handle_kick(data):
    room_id = data['room_id']
    player_name = data['player_name']
    
    if rooms[room_id][0] == players[request.sid]['name'] and player_name in rooms[room_id]:
        target_sid = next((sid for sid, info in players.items() 
                        if info['name'] == player_name and info['room'] == room_id), None)
        
        if target_sid:
            leave_room(room_id, sid=target_sid)
            rooms[room_id].remove(player_name)
            del players[target_sid]
            emit('you_were_kicked', {}, room=target_sid)
            emit('player_left', {
                'player_name': player_name,
                'remaining_players': rooms[room_id]
            }, room=room_id)

@app.route('/disconnect')
def handle_disconnect():
    if request.sid in players:
        player = players[request.sid]
        room_id = player['room']
        player_name = player['name']
        
        if room_id in rooms and player_name in rooms[room_id]:
            rooms[room_id].remove(player_name)
            emit('player_left', {
                'player_name': player_name,
                'remaining_players': rooms[room_id]
            }, room=room_id)
        del players[request.sid]

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)