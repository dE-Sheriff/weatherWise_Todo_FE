#!/usr/bin/env python3

from flask import Flask
from config import Config
from models import db, Task  # Import models
from app.routes import main  # Import the Blueprint

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///weatherwise.db'
    db.init_app(app)

    with app.app_context():
        db.create_all()

    app.register_blueprint(main)  # Register the Blueprint

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
