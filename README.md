# 🏥 Healis Healthcare DSA System

A comprehensive Data Structures and Algorithms (DSA) integration system for the Healis healthcare platform with dynamic MongoDB connectivity and real-time visualization.

## 🚀 Features

### Core DSA Implementations
- **Sorting Algorithms**: Quick Sort, Merge Sort, Heap Sort
- **Search Algorithms**: Linear Search, Binary Search, Fuzzy Search
- **Data Structures**: Hash Tables, Binary Search Trees, Priority Queues, Graphs
- **Healthcare Analytics**: Patient grouping, appointment analysis, conflict detection

### Dynamic MongoDB Integration
- **Real-time Data Fetching**: Automatic synchronization with MongoDB
- **Change Monitoring**: Detects new records and updates automatically
- **Caching System**: Efficient data caching with Hash Tables
- **Multiple Collections**: Supports all Healis schema collections

### Interactive Visualizations
- **Streamlit Dashboard**: Modern, responsive web interface
- **Plotly Charts**: Interactive charts and graphs
- **Real-time Updates**: Live data refresh capabilities
- **Performance Metrics**: Algorithm comparison and benchmarking

## 📋 Prerequisites

- Python 3.8+
- MongoDB instance
- Required Python packages (see requirements.txt)

## 🛠️ Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd healis-dsa
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure MongoDB connection**
   - Edit `.env` file with your MongoDB URI:
   ```env
   MONGODB_URI=your_mongodb_connection_string_here
   DATABASE_NAME=healis_db
   ```

## 🚀 Usage

### Running the Dashboard

1. **Start the Streamlit application**
   ```bash
   conda de
   ```

2. **Access the dashboard**
   - Open your browser to `http://localhost:8501`
   - Use the sidebar to connect to MongoDB and configure algorithms

### Dashboard Features

#### 📈 Overview Tab
- Total patients and appointments metrics
- Recent activity indicators
- Conflict detection alerts
- Frequent patient analysis

#### 👥 Patients Tab
- Age distribution visualization
- Gender demographics
- Registration timeline
- Sortable patient lists using different algorithms

#### 📅 Appointments Tab
- Appointment status distribution
- Doctor workload analysis
- Popular time slots
- Upcoming appointments list

#### 🔍 Search Tab
- Multi-algorithm patient search
- Fuzzy matching capabilities
- Real-time search results
- Similarity scoring

#### ⚡ Performance Tab
- Algorithm performance comparison
- Execution time benchmarks
- Scalability analysis

#### 🚨 Priority Queue Tab
- Urgent appointment prioritization
- Dynamic priority scoring
- Real-time priority updates

### Real-time Monitoring

**Start the change monitor**
```bash
python real_time_monitor.py
```

This will monitor your MongoDB for new records and trigger automatic updates.

## 🏗️ Architecture

### Project Structure
```
healis-dsa/
├── config/
│   └── database.py          # MongoDB configuration
├── dsa/
│   ├── data_structures.py   # Core data structures
│   └── algorithms.py        # Algorithm implementations
├── visualizations/
│   └── dashboard.py         # Streamlit dashboard
├── HEALIS-schema/           # Original MongoDB schemas
├── HEALIS-Admin-schema/     # Admin schemas
├── data_manager.py          # Data management layer
├── real_time_monitor.py     # Change monitoring
├── app.py                   # Main application
├── requirements.txt         # Dependencies
└── .env                     # Configuration

```

### Data Flow
1. **MongoDB** → **Data Manager** → **DSA Processing** → **Visualization**
2. **Real-time Monitor** → **Change Detection** → **Auto Refresh**
3. **User Input** → **Algorithm Selection** → **Dynamic Processing**

## 🔧 Configuration

### Environment Variables (.env)
```env
MONGODB_URI=mongodb://localhost:27017/healis_db
DATABASE_NAME=healis_db
APP_PORT=8501
DEBUG_MODE=True
```

### Supported Collections
- Users (Patients)
- Doctor Appointments
- Health Checkups
- Medications
- Lab Tests
- Vaccinations
- Mental Health Records
- Nutritionist Bookings
- Pharmacy Records
- Reminders
- Contacts

## 🎯 DSA Features

### Sorting Algorithms
- **Quick Sort**: Average O(n log n), good for general use
- **Merge Sort**: Guaranteed O(n log n), stable sorting
- **Heap Sort**: O(n log n), in-place sorting

### Search Algorithms
- **Linear Search**: O(n), works on unsorted data
- **Binary Search**: O(log n), requires sorted data
- **Fuzzy Search**: Approximate string matching

### Data Structures
- **Hash Table**: O(1) average lookup time
- **Binary Search Tree**: O(log n) operations
- **Priority Queue**: Efficient priority-based operations
- **Graph**: Relationship modeling and traversal

### Healthcare Analytics
- Age group analysis
- Appointment conflict detection
- Patient frequency analysis
- Doctor workload distribution
- Priority appointment scheduling

## 🔄 Real-time Features

### Automatic Updates
- Monitors MongoDB for new records
- Refreshes dashboard automatically
- Maintains data consistency
- Handles concurrent access

### Change Detection
- Polls database every 30 seconds (configurable)
- Detects new patients and appointments
- Triggers cache refresh
- Notifies dashboard components

## 📊 Performance

### Benchmarking
- Built-in algorithm performance comparison
- Execution time measurement
- Memory usage tracking
- Scalability analysis

### Optimization
- Intelligent caching system
- Lazy loading for large datasets
- Efficient data structures
- Minimal database queries

## 🛡️ Error Handling

- Comprehensive logging system
- Graceful database connection handling
- User-friendly error messages
- Automatic retry mechanisms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is part of the Healis healthcare system.

## 🆘 Support

For issues and questions:
1. Check the logs for error details
2. Verify MongoDB connection
3. Ensure all dependencies are installed
4. Check the .env configuration

## 🔮 Future Enhancements

- Machine Learning integration
- Advanced graph algorithms
- Real-time collaboration features
- Mobile responsive design
- API endpoints for external integration
