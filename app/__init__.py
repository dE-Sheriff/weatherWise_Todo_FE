#!/usr/bin/env python3

from flask import Flask
from config import Config
from models import Task, db
from flask_migrate import Migrate
from app.routes import main  # Import the main blueprint

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)  # Load configuration from Config object

    # Initialize the database and migration tool
    db.init_app(app)
    migrate = Migrate(app, db)

    # Register the blueprint
    app.register_blueprint(main)

    # Create database tables (if not using migrations)
    with app.app_context():
        db.create_all()

    return app
