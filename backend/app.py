from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from datetime import datetime
from datetime import timedelta
import random
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///eco_recycle.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key'

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)  # Access token expires in 30 days
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
jwt = JWTManager(app)

# Association table for the many-to-many relationship
user_event_association = db.Table(
    'user_event',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('event_id', db.Integer, db.ForeignKey('event.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    role = db.Column(db.Boolean(), nullable=False, default=0)
    password = db.Column(db.String(200), nullable=False)
    code = db.Column(db.Integer, nullable=False, unique=True)
    eco_coin = db.Column(db.Integer(), nullable=False, default=0)
    events = db.relationship('Event', secondary=user_event_association, back_populates='participants')

class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(100), nullable=False)
    date = db.Column(db.String(10), nullable=False)
    time = db.Column(db.String(5), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    participants_count = db.Column(db.Integer, default=0)
    awards = db.Column(db.String(200), nullable=True)
    participants = db.relationship('User', secondary=user_event_association, back_populates='events')

# Routesimport random

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    # Check if the username already exists
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    # Generate a random 6-digit code
    code = random.randint(100000, 999999)

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Create a new user with the generated code
    new_user = User(username=username, password=hashed_password, code=code)

    # Add the user to the database
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "User registered successfully", "code": code}), 201


@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid credentials"}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_access_token(identity=user.id, fresh=False)  # Create a refresh token

    return jsonify({"access_token": access_token, "refresh_token": refresh_token, "username": user.username, "role": user.role}), 200

@app.route('/api/events', methods=['GET'])
def get_events():
    events = Event.query.all()
    return jsonify([{
        "id": event.id,
        "name": event.name,
        "location": event.location,
        "date": event.date,
        "time": event.time,
        "description": event.description,
        "image_url": event.image_url,
        "participants": [participant.username for participant in event.participants],
        "awards": event.awards
    } for event in events]), 200

@app.route('/api/events', methods=['POST'])
@jwt_required()
def create_event():
    data = request.json
    # Get user ID from JWT token
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    new_event = Event(
        name=data['name'],
        location=data['location'],
        date=data['date'],
        time=data['time'],
        description=data.get('description', ''),
        image_url=data.get('image_url', ''),
        participants=[],  # Corrected: Initialize as an empty list
        awards=data.get('awards', '')
    )
    db.session.add(new_event)
    db.session.commit()
    return jsonify({"message": "Event created successfully"}), 201

@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    event = Event.query.get(event_id)
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # Remove event from user's joined events
    if event in current_user.events:
        current_user.events.remove(event)

    db.session.delete(event)
    db.session.commit()

    return jsonify({"message": f"Event deleted successfully", "awards": event.awards}), 200

@app.route('/api/events/<int:event_id>/join', methods=['POST'])
@jwt_required()
def join_event(event_id):
    # Fetch the current user
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    if not current_user:
        return jsonify({"error": "User not found"}), 404

    # Fetch the event
    event = Event.query.get(event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    # Check if the user has already joined the event
    if event in current_user.events:
        return jsonify({"error": "User already joined this event"}), 400

    # Add user to the event's participants
    current_user.events.append(event)
    event.participants_count = len(event.participants)  # Update participants count
    db.session.commit()

    return jsonify({"message": "Participant added successfully", "event_id": event.id, "event_name": event.name}), 200

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_user_profile():
    # Get the current user's ID
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Return user data along with events they have joined
    return jsonify({
        "id": user.id,
        "username": user.username,
        "role": user.role,
        "events": [event.name for event in user.events]  # Include events user has joined
    }), 200

@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)  # This ensures the request has a valid refresh token
def refresh():
    # Get the identity (user_id) from the refresh token
    current_user_id = get_jwt_identity()
    
    # Create a new access token
    new_access_token = create_access_token(identity=current_user_id)
    
    return jsonify({"access_token": new_access_token}), 200

@app.route('/api/redeem', methods=['POST'])
@jwt_required()
def redeem():
    
    # Get the current user from the JWT token
    current_user_id = get_jwt_identity()
    
    # Parse the incoming request
    data = request.get_json()
    points = data.get('points')
    
    # Validate points (ensure it's a positive number)
    if not points or points <= 0:
        return jsonify({"error": "Invalid points"}), 400

    # Get the user from the database
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update the user's eco coins
    user.eco_coin += points
    db.session.commit()

    return jsonify({"message": "Redemption successful", "eco_coin": user.eco_coin}), 200

@app.route('/api/ecocoins/all', methods=['POST', 'GET'])
@jwt_required()
def get_coins():
    # Get the current user's identity
    current_user = get_jwt_identity()

    try:
        # Fetch the user from the database
        user = User.query.get(current_user)

        if not user:
            return jsonify({"message": "მომხმარებელი ვერ მოიძებნა"}), 404

        # Return the total EcoCoins
        return jsonify({"totalEcoCoins": user.eco_coin}), 200
    except Exception as e:
        return jsonify({"message": "შეცდომა მონაცემების მიღებაში", "error": str(e)}), 500




# Initialize Database
@app.before_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
