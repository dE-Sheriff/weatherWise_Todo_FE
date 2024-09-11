#!/usr/bin/env python3

from flask import Blueprint, jsonify
from flask import render_template
from models import db
from models import Task 

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return render_template('index.html')

@main.route('/tasks')
def tasks():
    tasks = Task.query.all()
    return render_template('tasks.html', tasks=tasks)

@main.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})
