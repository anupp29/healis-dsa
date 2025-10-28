"""
Real-time MongoDB Change Monitor
"""
import time
import logging
from datetime import datetime
from threading import Thread
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from data_manager import data_manager

class MongoChangeMonitor:
    """Monitor MongoDB for real-time changes"""
    
    def __init__(self, check_interval: int = 30):
        self.check_interval = check_interval
        self.is_running = False
        self.logger = logging.getLogger(__name__)
        self.last_check = datetime.now()
        
    def start_monitoring(self, callback_func=None):
        """Start monitoring for database changes"""
        self.is_running = True
        self.logger.info("Starting MongoDB change monitoring...")
        
        def monitor_loop():
            while self.is_running:
                try:
                    # Check for new records
                    new_records_count = data_manager.monitor_new_records(callback_func)
                    
                    if new_records_count > 0:
                        self.logger.info(f"Detected {new_records_count} new records")
                    
                    time.sleep(self.check_interval)
                    
                except Exception as e:
                    self.logger.error(f"Error in monitoring loop: {e}")
                    time.sleep(self.check_interval)
        
        # Start monitoring in a separate thread
        monitor_thread = Thread(target=monitor_loop, daemon=True)
        monitor_thread.start()
        
        return monitor_thread
    
    def stop_monitoring(self):
        """Stop monitoring"""
        self.is_running = False
        self.logger.info("Stopped MongoDB change monitoring")

class RealTimeUpdater:
    """Handle real-time updates for the dashboard"""
    
    def __init__(self):
        self.monitor = MongoChangeMonitor()
        self.update_callbacks = []
        
    def add_update_callback(self, callback):
        """Add a callback function for updates"""
        self.update_callbacks.append(callback)
    
    def handle_database_change(self, change_info):
        """Handle database changes"""
        print(f"Database change detected: {change_info}")
        
        # Notify all registered callbacks
        for callback in self.update_callbacks:
            try:
                callback(change_info)
            except Exception as e:
                print(f"Error in update callback: {e}")
    
    def start(self):
        """Start real-time monitoring"""
        return self.monitor.start_monitoring(self.handle_database_change)
    
    def stop(self):
        """Stop real-time monitoring"""
        self.monitor.stop_monitoring()

# Example usage for testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    
    def test_callback(change_info):
        print(f"Change detected: {change_info}")
    
    updater = RealTimeUpdater()
    updater.add_update_callback(test_callback)
    
    # Connect to database
    if data_manager.connect_to_database():
        print("Connected to MongoDB")
        
        # Start monitoring
        monitor_thread = updater.start()
        
        try:
            print("Monitoring for changes... Press Ctrl+C to stop")
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\nStopping monitor...")
            updater.stop()
    else:
        print("Failed to connect to MongoDB")
