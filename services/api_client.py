#!/usr/bin/env python3

from flask import Flask, request, jsonify
import requests


def fetch_weather_data(api_key, latitude, longitude):
    """
    Fetches weather data from OpenWeather API.
    
    :param api_key: Your OpenWeather API key.
    :param latitude: Latitude of the location.
    :param longitude: Longitude of the location.
    :return: JSON response containing weather data.
    """
    url = f"http://api.openweathermap.org/data/2.5/forecast?lat={latitude}&lon={longitude}&appid={api_key}&units=metric"
    response = requests.get(url)
    
    if response.status_code == 200:
        return response.json()
    else:
        response.raise_for_status()
