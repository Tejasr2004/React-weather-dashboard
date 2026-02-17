# Weather Application

A simple weather application that fetches real-time weather data and displays it with a clean, responsive UI.

## Features

- **Real-time Weather Data**: Fetches current weather information using the Weatherstack API.
- **Dynamic Backgrounds**: The background changes based on the weather conditions.
- **Search Functionality**: Allows users to search for weather by city.
- **Concurrent Server Execution**: Runs both the backend (Express) and frontend (Vite) with a single command.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, Axios
- **API**: Weatherstack

## Prerequisites

- Node.js (v14 or higher)
- npm

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    cd weather-application
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

To start both the backend server and the frontend development server concurrently, run:

```bash
npm run start:all
```

- The backend server runs on `http://localhost:3000`
- The frontend application will be available at the URL provided by Vite (usually `http://localhost:5173`)

## API Key

The Weatherstack API key is configured in `server.js`.
