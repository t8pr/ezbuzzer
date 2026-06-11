# EzBuzzer

A lightweight, real-time virtual buzzer web application. Perfect for trivia nights, game jams, or any event where you need a fast and reliable way to see who buzzed in first.

## Features

* Room System: Create or join dedicated rooms instantly.
* Real-Time Synchronization: Fast, lag-free buzzer tracking so you always know exactly who was first.
* Modern Interface: Clean, simple, and distraction-free UI/UX.
* Lightweight: Built to be fast and easy to deploy.

## Tech Stack

* Backend: Python (Flask)
* Frontend: Vanilla JavaScript, HTML5, CSS3
* Real-Time: WebSockets / Socket.IO

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Make sure you have Python installed. You can download it from python.org.

### Installation

1. Clone the repository:
   git clone https://github.com/t8pr/ezbuzzer.git
   cd ezbuzzer

2. Set up a virtual environment (Recommended):
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate

3. Install the dependencies:
   pip install -r requirements.txt

4. Run the application:
   python app.py

5. Open your browser:
   Navigate to http://localhost:8080 (or the port specified in your terminal) to start buzzing.

## Project Structure

* /app.py - Main application logic and routing.
* /requirements.txt - Project dependencies.
* /templates/ - HTML files (index.html, room.html).
* /static/ - Frontend assets (style.css, script.js).

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check the issues page if you want to contribute.

## License

This project is open-source and available under the MIT License. Made by Abo7amdan
