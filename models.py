#!/usr/bin/env python3

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    end_time = db.Column(db.Time, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    suggested_by_app = db.Column(db.Boolean, default=False)
    remark = db.Column(db.String(255), nullable=True)
    is_completed = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Task {self.title} | Start: {self.start_date} {self.start_time}>'
