"""
Interactive Dashboard for Healthcare DSA Visualization
"""
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import logging
import sys
import os

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from data_manager import data_manager
from dsa.algorithms import HealthcareAnalytics

# Configure logging
logging.basicConfig(level=logging.INFO)

class HealthcareDashboard:
    """Main dashboard class for healthcare data visualization"""
    
    def __init__(self):
        self.data_manager = data_manager
        
    def setup_page(self):
        """Setup Streamlit page configuration"""
        st.set_page_config(
            page_title="Healis DSA Dashboard",
            page_icon="🏥",
            layout="wide",
            initial_sidebar_state="expanded"
        )
        
        st.title("🏥 Healis Healthcare DSA Dashboard")
        st.markdown("---")
    
    def sidebar_controls(self):
        """Create sidebar controls"""
        st.sidebar.header("🔧 Controls")
        
        # Database connection
        if st.sidebar.button("🔄 Connect to Database"):
            with st.spinner("Connecting to MongoDB..."):
                if self.data_manager.connect_to_database():
                    st.sidebar.success("✅ Connected to MongoDB!")
                else:
                    st.sidebar.error("❌ Failed to connect to MongoDB")
        
        # Data refresh
        if st.sidebar.button("📊 Refresh Data"):
            with st.spinner("Refreshing data..."):
                self.refresh_data()
                st.sidebar.success("✅ Data refreshed!")
        
        # Algorithm selection
        st.sidebar.subheader("🔍 Algorithm Settings")
        
        sort_algorithm = st.sidebar.selectbox(
            "Sorting Algorithm",
            ["quick", "merge", "heap", "python_builtin"],
            help="Choose sorting algorithm for data processing"
        )
        
        search_type = st.sidebar.selectbox(
            "Search Type",
            ["fuzzy", "linear", "id"],
            help="Choose search algorithm type"
        )
        
        return sort_algorithm, search_type
    
    def refresh_data(self):
        """Refresh all data from database"""
        try:
            # Force refresh of cached data
            self.data_manager.fetch_all_patients(force_refresh=True)
            self.data_manager.fetch_all_appointments()
            return True
        except Exception as e:
            st.error(f"Error refreshing data: {e}")
            return False
    
    def display_overview_metrics(self):
        """Display overview metrics"""
        st.header("📈 Overview Metrics")
        
        try:
            analytics = self.data_manager.get_analytics_data()
            
            col1, col2, col3, col4 = st.columns(4)
            
            with col1:
                st.metric(
                    label="👥 Total Patients",
                    value=analytics['total_patients'],
                    delta=f"+{len(self.data_manager.fetch_recent_records('users', 24))} today"
                )
            
            with col2:
                st.metric(
                    label="📅 Total Appointments",
                    value=analytics['total_appointments'],
                    delta=f"+{len(analytics['upcoming_appointments'])} upcoming"
                )
            
            with col3:
                conflicts = len(analytics['conflicts'])
                st.metric(
                    label="⚠️ Conflicts",
                    value=conflicts,
                    delta="0" if conflicts == 0 else f"{conflicts} conflicts"
                )
            
            with col4:
                frequent_count = len(analytics['frequent_patients'])
                st.metric(
                    label="🔄 Frequent Patients",
                    value=frequent_count,
                    delta=f"{frequent_count} patients"
                )
                
        except Exception as e:
            st.error(f"Error loading overview metrics: {e}")
    
    def display_patient_analytics(self, sort_algorithm):
        """Display patient analytics and visualizations"""
        st.header("👥 Patient Analytics")
        
        try:
            # Get sorted patients
            patients = self.data_manager.sort_patients(
                sort_by='name', 
                algorithm=sort_algorithm
            )
            
            if not patients:
                st.warning("No patient data available. Please check your database connection.")
                return
            
            col1, col2 = st.columns(2)
            
            with col1:
                # Age distribution
                st.subheader("📊 Age Distribution")
                analytics = self.data_manager.get_analytics_data()
                age_groups = analytics['age_groups']
                
                age_data = {
                    'Age Group': list(age_groups.keys()),
                    'Count': [len(patients_list) for patients_list in age_groups.values()]
                }
                
                fig_age = px.pie(
                    values=age_data['Count'],
                    names=age_data['Age Group'],
                    title="Patient Age Distribution"
                )
                st.plotly_chart(fig_age, use_container_width=True)
            
            with col2:
                # Gender distribution
                st.subheader("⚥ Gender Distribution")
                gender_counts = {}
                for patient in patients:
                    gender = patient.gender or 'Unknown'
                    gender_counts[gender] = gender_counts.get(gender, 0) + 1
                
                if gender_counts:
                    fig_gender = px.bar(
                        x=list(gender_counts.keys()),
                        y=list(gender_counts.values()),
                        title="Patient Gender Distribution"
                    )
                    st.plotly_chart(fig_gender, use_container_width=True)
            
            # Patient registration timeline
            st.subheader("📈 Patient Registration Timeline")
            
            # Create timeline data
            timeline_data = []
            for patient in patients:
                if patient.created_at:
                    date = patient.created_at.date()
                    timeline_data.append(date)
            
            if timeline_data:
                df_timeline = pd.DataFrame({'Date': timeline_data})
                df_timeline['Count'] = 1
                df_grouped = df_timeline.groupby('Date').sum().reset_index()
                
                fig_timeline = px.line(
                    df_grouped,
                    x='Date',
                    y='Count',
                    title="Patient Registrations Over Time"
                )
                st.plotly_chart(fig_timeline, use_container_width=True)
                
        except Exception as e:
            st.error(f"Error displaying patient analytics: {e}")
    
    def display_appointment_analytics(self, sort_algorithm):
        """Display appointment analytics and visualizations"""
        st.header("📅 Appointment Analytics")
        
        try:
            appointments = self.data_manager.sort_appointments(
                sort_by='date',
                algorithm=sort_algorithm
            )
            
            if not appointments:
                st.warning("No appointment data available.")
                return
            
            analytics = self.data_manager.get_analytics_data()
            
            col1, col2 = st.columns(2)
            
            with col1:
                # Appointment status distribution
                st.subheader("📊 Appointment Status")
                status_data = analytics['appointment_analysis']['appointment_status']
                
                fig_status = px.pie(
                    values=list(status_data.values()),
                    names=list(status_data.keys()),
                    title="Appointment Status Distribution"
                )
                st.plotly_chart(fig_status, use_container_width=True)
            
            with col2:
                # Doctor workload
                st.subheader("👨‍⚕️ Doctor Workload")
                doctor_load = analytics['appointment_analysis']['doctor_load']
                
                # Take top 10 doctors
                top_doctors = dict(list(doctor_load.items())[:10])
                
                fig_doctors = px.bar(
                    x=list(top_doctors.values()),
                    y=list(top_doctors.keys()),
                    orientation='h',
                    title="Top 10 Doctors by Appointment Count"
                )
                st.plotly_chart(fig_doctors, use_container_width=True)
            
            # Popular time slots
            st.subheader("⏰ Popular Time Slots")
            time_slots = analytics['appointment_analysis']['popular_time_slots']
            
            if time_slots:
                fig_time = px.bar(
                    x=list(time_slots.keys()),
                    y=list(time_slots.values()),
                    title="Most Popular Appointment Time Slots"
                )
                st.plotly_chart(fig_time, use_container_width=True)
            
            # Upcoming appointments
            st.subheader("📋 Upcoming Appointments")
            upcoming = analytics['upcoming_appointments']
            
            if upcoming:
                upcoming_data = []
                for apt in upcoming[:10]:  # Show top 10
                    upcoming_data.append({
                        'Patient': apt.patient_name,
                        'Doctor': apt.doctor_name,
                        'Date': apt.appointment_date.strftime('%Y-%m-%d') if apt.appointment_date else 'N/A',
                        'Time': apt.appointment_time,
                        'Status': apt.status
                    })
                
                df_upcoming = pd.DataFrame(upcoming_data)
                st.dataframe(df_upcoming, use_container_width=True)
            else:
                st.info("No upcoming appointments in the next 7 days.")
                
        except Exception as e:
            st.error(f"Error displaying appointment analytics: {e}")
    
    def display_search_interface(self, search_type):
        """Display search interface"""
        st.header("🔍 Search Interface")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            search_query = st.text_input(
                "Search Patients",
                placeholder="Enter patient name or ID...",
                help="Search for patients using different algorithms"
            )
        
        with col2:
            search_button = st.button("🔍 Search", type="primary")
        
        if search_button and search_query:
            with st.spinner(f"Searching using {search_type} algorithm..."):
                try:
                    results = self.data_manager.search_patients(search_query, search_type)
                    
                    if results:
                        st.success(f"Found {len(results)} results:")
                        
                        for i, (index, patient, similarity) in enumerate(results[:10]):
                            with st.expander(f"Result {i+1}: {patient.full_name} (Similarity: {similarity:.2f})"):
                                col1, col2 = st.columns(2)
                                
                                with col1:
                                    st.write(f"**Patient ID:** {patient.patient_id}")
                                    st.write(f"**Name:** {patient.full_name}")
                                    st.write(f"**Email:** {patient.email}")
                                
                                with col2:
                                    st.write(f"**Phone:** {patient.phone}")
                                    st.write(f"**Gender:** {patient.gender}")
                                    if patient.dob:
                                        age = HealthcareAnalytics.calculate_age(patient.dob)
                                        st.write(f"**Age:** {age} years")
                    else:
                        st.warning("No results found for your search query.")
                        
                except Exception as e:
                    st.error(f"Error during search: {e}")
    
    def display_algorithm_comparison(self):
        """Display algorithm performance comparison"""
        st.header("⚡ Algorithm Performance Comparison")
        
        try:
            import time
            
            # Get sample data
            patients = self.data_manager.fetch_all_patients()
            
            if not patients:
                st.warning("No data available for performance testing.")
                return
            
            algorithms = ['quick', 'merge', 'heap']
            performance_data = []
            
            for algorithm in algorithms:
                start_time = time.time()
                sorted_patients = self.data_manager.sort_patients(
                    sort_by='name',
                    algorithm=algorithm
                )
                end_time = time.time()
                
                performance_data.append({
                    'Algorithm': algorithm.title(),
                    'Time (seconds)': round(end_time - start_time, 4),
                    'Records Processed': len(sorted_patients)
                })
            
            df_performance = pd.DataFrame(performance_data)
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.subheader("📊 Performance Metrics")
                st.dataframe(df_performance, use_container_width=True)
            
            with col2:
                st.subheader("📈 Performance Chart")
                fig_perf = px.bar(
                    df_performance,
                    x='Algorithm',
                    y='Time (seconds)',
                    title="Sorting Algorithm Performance Comparison"
                )
                st.plotly_chart(fig_perf, use_container_width=True)
                
        except Exception as e:
            st.error(f"Error in performance comparison: {e}")
    
    def display_priority_queue_demo(self):
        """Display priority queue demonstration"""
        st.header("🚨 Priority Queue - Urgent Appointments")
        
        try:
            priority_appointments = self.data_manager.get_priority_appointments()
            
            if priority_appointments:
                st.subheader("Top 10 Priority Appointments")
                
                priority_data = []
                for i, appointment in enumerate(priority_appointments[:10]):
                    priority_score = self.data_manager._calculate_appointment_priority(appointment)
                    priority_data.append({
                        'Rank': i + 1,
                        'Patient': appointment.patient_name,
                        'Doctor': appointment.doctor_name,
                        'Specialty': appointment.specialty,
                        'Date': appointment.appointment_date.strftime('%Y-%m-%d') if appointment.appointment_date else 'N/A',
                        'Time': appointment.appointment_time,
                        'Status': appointment.status,
                        'Priority Score': priority_score
                    })
                
                df_priority = pd.DataFrame(priority_data)
                st.dataframe(df_priority, use_container_width=True)
                
                # Priority distribution chart
                fig_priority = px.bar(
                    df_priority,
                    x='Rank',
                    y='Priority Score',
                    hover_data=['Patient', 'Doctor'],
                    title="Priority Scores for Top Appointments"
                )
                st.plotly_chart(fig_priority, use_container_width=True)
            else:
                st.info("No appointments available for priority analysis.")
                
        except Exception as e:
            st.error(f"Error displaying priority queue: {e}")
    
    def run(self):
        """Run the main dashboard"""
        self.setup_page()
        
        # Sidebar controls
        sort_algorithm, search_type = self.sidebar_controls()
        
        # Main content tabs
        tab1, tab2, tab3, tab4, tab5, tab6 = st.tabs([
            "📈 Overview", 
            "👥 Patients", 
            "📅 Appointments", 
            "🔍 Search", 
            "⚡ Performance", 
            "🚨 Priority Queue"
        ])
        
        with tab1:
            self.display_overview_metrics()
        
        with tab2:
            self.display_patient_analytics(sort_algorithm)
        
        with tab3:
            self.display_appointment_analytics(sort_algorithm)
        
        with tab4:
            self.display_search_interface(search_type)
        
        with tab5:
            self.display_algorithm_comparison()
        
        with tab6:
            self.display_priority_queue_demo()
        
        # Footer
        st.markdown("---")
        st.markdown("🏥 **Healis Healthcare DSA Dashboard** - Powered by Python, MongoDB, and Streamlit")

if __name__ == "__main__":
    dashboard = HealthcareDashboard()
    dashboard.run()
