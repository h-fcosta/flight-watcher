# Changelog

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

#### 🔄 Changed
- **Architecture**: Migrated from CLI-based to web-based architecture
- **Configuration**: Updated from simple env vars to Pydantic settings
- **API Integration**: Improved Amadeus API client with better error handling
- **Database**: Enhanced models with additional fields and relationships
- **Notifications**: Improved Telegram service with better formatting
- **Logging**: Enhanced logging system with structured format

#### 🗑️ Removed
- **Old Test Files**: Removed obsolete test and debug files
  - `debug_credentials.py`
  - `diagnose_final.py`
  - `test_auth.py`
  - `test_run.py`
  - `test_telegram.py`
  - `test_url_config.py`
  - `fastapi_proposal.py`

#### 🔧 Technical Details
- **Framework**: FastAPI with Uvicorn server
- **Frontend**: HTML5, Bootstrap 5, Vanilla JavaScript
- **Database**: SQLAlchemy 2.0 with SQLite
- **Validation**: Pydantic v2 for data validation
- **Scheduling**: APScheduler for background jobs
- **Charts**: Plotly.js for data visualization
- **Responsive**: Mobile-first design approach

#### 📂 New File Structure
```
flight-watcher/
├── main_api.py              # FastAPI application entry point
├── config.py                # Centralized configuration
├── api/
│   ├── database.py         # Database configuration
│   ├── models.py           # SQLAlchemy models
│   ├── routers/            # API endpoints
│   ├── services/           # Business logic
│   └── schemas/            # Pydantic schemas
├── templates/              # Jinja2 templates
├── static/                 # CSS, JS, and assets
└── app/                    # Legacy CLI system (preserved)
```

#### 🔄 Migration Notes
- Legacy `main.py` CLI system is preserved for compatibility
- Environment variables updated (see `.env.example`)
- Database schema is backward compatible
- All existing data is preserved during migration

#### 🚀 Usage
- **Web Interface**: `python main_api.py` → http://localhost:8000
- **Legacy CLI**: `python main.py` (still available)
- **API Documentation**: http://localhost:8000/docs

---

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
