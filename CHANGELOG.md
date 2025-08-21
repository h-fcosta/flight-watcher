# Changelog

## [2.1.0] - 2025-08-20

### 🧹 Legacy System Cleanup

#### 🗑️ Removed
- **Legacy CLI System**: Removed `main.py` and `app/` directory
- **Backward Compatibility**: Removed support for old environment variables
- **Old Documentation**: Cleaned up README and removed legacy references
- **Obsolete Files**: Removed all CLI-related code and configurations

#### 🔄 Updated
- **Simplified Configuration**: Removed legacy variable support from `config.py`
- **Clean Documentation**: Updated README with modern, streamlined instructions
- **Startup Script**: Simplified `start.sh` to only support web interface
- **Environment Example**: Cleaned up `.env.example` to show only current variables

#### ✨ Result
- **Single Interface**: Web-only application, no CLI confusion
- **Cleaner Codebase**: Removed thousands of lines of legacy code
- **Simplified Setup**: One way to run the application
- **Modern Focus**: Pure FastAPI web application

---

## [2.0.0] - 2025-08-20

### 🚀 Major Refactoring - FastAPI Web Interface

#### ✅ Added
- **FastAPI Web Application**: Complete web interface replacing command-line interface
- **Modern Dashboard**: Real-time monitoring with statistics and charts
- **Route Management**: Full CRUD interface for flight routes
- **Deals Page**: Comprehensive promotion tracking and filtering
- **REST API**: Complete RESTful API with automatic documentation
- **Responsive Design**: Mobile-friendly interface with Bootstrap
- **Interactive JavaScript**: Real-time updates and AJAX functionality
- **Background Scheduler**: Non-blocking automatic price checking
- **Enhanced Database Models**: Improved schema with timestamps and job logging
- **Configuration Management**: Centralized settings with Pydantic
- **Auto-refresh**: Configurable automatic data updates
- **Export Functionality**: CSV export for deals and statistics
- **Search Interface**: Manual flight search directly from dashboard

####  Technical Details
- **Framework**: FastAPI with Uvicorn server
- **Frontend**: HTML5, Bootstrap 5, Vanilla JavaScript
- **Database**: SQLAlchemy 2.0 with SQLite
- **Validation**: Pydantic v2 for data validation
- **Scheduling**: APScheduler for background jobs
- **Charts**: Plotly.js for data visualization
- **Responsive**: Mobile-first design approach

#### 📂 File Structure
```
flight-watcher/
├── main_api.py              # FastAPI application entry point
├── config.py                # Centralized configuration
├── start.sh                 # Startup script
├── api/
│   ├── database.py         # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── routers/            # API endpoints
│   ├── services/           # Business logic
│   └── schemas/            # Pydantic schemas
├── templates/              # Jinja2 templates
└── static/                 # CSS, JS, and assets
```

#### 🚀 Usage
- **Web Interface**: `./start.sh` → http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## [1.0.0] - Previous Version

### Features

- Command-line flight price monitoring
- Amadeus API integration
- Telegram bot notifications
- SQLite database storage
- Automatic scheduling with APScheduler
- Basic route management via Telegram commands

### Architecture

- Single-file CLI application
- Blocking scheduler
- Simple environment variable configuration
- Basic SQLAlchemy models
