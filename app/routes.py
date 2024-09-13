#!/usr/bin/env python3

from flask import Blueprint, jsonify
from flask import render_template,  Flask, jsonify, request
from models import db
from models import Task
import requests

API_KEY = 'fccb7140ec9703e9de31a771d85387e3'

main = Blueprint('main', __name__)

def get_weather_data(lat, lon, exclude=""):
    """
    Fetch weather data from OpenWeather API based on the given coordinates.
    :param lat: Latitude
    :param lon: Longitude
    :param exclude: Optional; Parts of the weather data to exclude.
    :return: JSON response from OpenWeather API.
    """
    url = f"https://api.openweathermap.org/data/3.0/onecall"
    params = {
        'lat': lat,
        'lon': lon,
        'exclude': exclude,
        'appid': API_KEY,
        'units': 'metric'  # You can change this to 'imperial' or 'standard'
    }

    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json()
    else:
        return {'error': 'Could not fetch weather data'}, response.status_code

def get_five_day_forecast(lat, lon):
    """
    Fetches a 5-day weather forecast with 3-hour intervals from OpenWeather API based on latitude and longitude.
    """
    url = f"http://api.openweathermap.org/data/2.5/forecast"
    params = {
        'lat': lat,
        'lon': lon,
        'appid': API_KEY,
        'units': 'metric',  # Change to 'imperial' for Fahrenheit
        'cnt': 40  # Limit the number of results (max = 40)
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        return response.json()  # Return the JSON data if successful
    else:
        return {'error': 'Could not fetch weather data'}, response.status_code

@main.route('/')
def home():
    return render_template('index.html')  # This renders the HTML file

@main.route('/tasks')
def tasks():
    tasks = Task.query.all()
    return render_template('tasks.html', tasks=tasks)

@main.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

# @main.route('/weather', methods=['GET'])
# def get_real_weather():
#     lat = request.args.get('lat')
#     lon = request.args.get('lon')
#     exclude = request.args.get('exclude', '')  # Optional exclude parameter

#     if lat and lon:
#         weather_data = get_weather_data(lat, lon, exclude)
#         return jsonify(weather_data)
#     else:
#         return jsonify({"error": "Please provide valid latitude and longitude."}), 400

@main.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if lat and lon:
        weather_data = get_five_day_forecast(lat, lon)  # Use the new function
        return jsonify(weather_data)
    else:
        return jsonify({"error": "Please provide valid latitude and longitude."}), 400
    