"""
HEAL Platform - Modern Interactive Dashboard
Next-generation DSA visualization with stunning animations
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
import time
import asyncio
from datetime import datetime
import json

# Configure page
st.set_page_config(
    page_title="HEAL - DSA Visualization Platform",
    page_icon="🧠",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for modern styling
st.markdown("""
<style>
    .main-header {
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        padding: 2rem;
        border-radius: 10px;
        color: white;
        text-align: center;
        margin-bottom: 2rem;
    }
    
    .metric-card {
        background: white;
        padding: 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-left: 4px solid #667eea;
    }
    
    .algorithm-status {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        color: white;
        font-weight: bold;
        display: inline-block;
        margin: 0.2rem;
    }
    
    .status-running { background-color: #28a745; }
    .status-completed { background-color: #007bff; }
    .status-idle { background-color: #6c757d; }
</style>
""", unsafe_allow_html=True)

class HEALDashboard:
    def __init__(self):
        self.initialize_session_state()
    
    def initialize_session_state(self):
        """Initialize session state variables"""
        if 'algorithm_history' not in st.session_state:
            st.session_state.algorithm_history = []
        if 'current_algorithm' not in st.session_state:
            st.session_state.current_algorithm = None
        if 'data_structures' not in st.session_state:
            st.session_state.data_structures = {}
    
    def render_header(self):
        """Render the main header"""
        st.markdown("""
        <div class="main-header">
            <h1>🧠 HEAL Platform</h1>
            <p>Next-Generation Data Structures & Algorithms Visualization</p>
        </div>
        """, unsafe_allow_html=True)
    
    def render_sidebar(self):
        """Render the control sidebar"""
        st.sidebar.header("🎛️ Control Center")
        
        # Database connections
        st.sidebar.subheader("📊 Data Sources")
        
        col1, col2 = st.sidebar.columns(2)
        with col1:
            healis_status = st.button("🏥 Healis DB", key="healis_connect")
        with col2:
            admin_status = st.button("👨‍💼 Admin DB", key="admin_connect")
        
        # Algorithm selection
        st.sidebar.subheader("🔧 Algorithm Engine")
        
        algorithm_type = st.sidebar.selectbox(
            "Select Algorithm Type",
            ["Sorting", "Searching", "Graph", "Dynamic Programming", "Recursion"]
        )
        
        if algorithm_type == "Sorting":
            algorithm = st.sidebar.selectbox(
                "Choose Algorithm",
                ["Bubble Sort", "Quick Sort", "Merge Sort", "Heap Sort"]
            )
        elif algorithm_type == "Searching":
            algorithm = st.sidebar.selectbox(
                "Choose Algorithm", 
                ["Linear Search", "Binary Search", "DFS", "BFS"]
            )
        elif algorithm_type == "Graph":
            algorithm = st.sidebar.selectbox(
                "Choose Algorithm",
                ["Dijkstra", "A* Pathfinding", "Minimum Spanning Tree"]
            )
        elif algorithm_type == "Dynamic Programming":
            algorithm = st.sidebar.selectbox(
                "Choose Algorithm",
                ["Fibonacci", "Longest Common Subsequence", "Knapsack"]
            )
        else:  # Recursion
            algorithm = st.sidebar.selectbox(
                "Choose Algorithm",
                ["Tower of Hanoi", "N-Queens", "Maze Solver"]
            )
        
        # Animation controls
        st.sidebar.subheader("🎬 Animation")
        speed = st.sidebar.slider("Speed", 0.1, 3.0, 1.0, 0.1)
        
        # Data structure selection
        st.sidebar.subheader("📋 Data Structures")
        data_structure = st.sidebar.selectbox(
            "Select Structure",
            ["Array", "Stack", "Queue", "Linked List", "Binary Tree", "Graph", "Hash Table"]
        )
        
        return {
            'algorithm_type': algorithm_type,
            'algorithm': algorithm,
            'speed': speed,
            'data_structure': data_structure
        }
    
    def create_algorithm_visualization(self, algorithm_type, algorithm):
        """Create algorithm-specific visualizations"""
        
        if algorithm_type == "Sorting" and algorithm == "Bubble Sort":
            return self.bubble_sort_visualization()
        elif algorithm_type == "Sorting" and algorithm == "Quick Sort":
            return self.quick_sort_visualization()
        elif algorithm_type == "Graph" and algorithm == "Dijkstra":
            return self.dijkstra_visualization()
        else:
            return self.default_visualization()
    
    def bubble_sort_visualization(self):
        """Create bubble sort visualization"""
        # Sample data
        data = [64, 34, 25, 12, 22, 11, 90]
        
        fig = go.Figure()
        
        # Add bars
        fig.add_trace(go.Bar(
            x=list(range(len(data))),
            y=data,
            marker_color=['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
            text=data,
            textposition='auto',
        ))
        
        fig.update_layout(
            title="Bubble Sort Visualization",
            xaxis_title="Index",
            yaxis_title="Value",
            showlegend=False,
            height=400
        )
        
        return fig
    
    def quick_sort_visualization(self):
        """Create quick sort visualization"""
        data = [64, 34, 25, 12, 22, 11, 90]
        
        fig = go.Figure()
        
        # Add bars with pivot highlighting
        colors = ['#FF6B6B' if i == len(data)-1 else '#4ECDC4' for i in range(len(data))]
        
        fig.add_trace(go.Bar(
            x=list(range(len(data))),
            y=data,
            marker_color=colors,
            text=data,
            textposition='auto',
        ))
        
        fig.update_layout(
            title="Quick Sort Visualization (Pivot in Red)",
            xaxis_title="Index", 
            yaxis_title="Value",
            showlegend=False,
            height=400
        )
        
        return fig
    
    def dijkstra_visualization(self):
        """Create Dijkstra's algorithm visualization"""
        # Create a sample graph
        nodes = ['A', 'B', 'C', 'D', 'E']
        edges = [('A', 'B', 4), ('A', 'C', 2), ('B', 'C', 1), ('B', 'D', 5), ('C', 'D', 8), ('C', 'E', 10), ('D', 'E', 2)]
        
        # Create network graph
        fig = go.Figure()
        
        # Add edges
        for edge in edges:
            fig.add_trace(go.Scatter(
                x=[0, 1], y=[0, 1],  # Placeholder coordinates
                mode='lines',
                line=dict(width=2, color='gray'),
                showlegend=False
            ))
        
        # Add nodes
        fig.add_trace(go.Scatter(
            x=[0, 1, 2, 1, 2],  # Node positions
            y=[0, 1, 0, -1, -1],
            mode='markers+text',
            marker=dict(size=30, color='lightblue', line=dict(width=2, color='darkblue')),
            text=nodes,
            textposition='middle center',
            showlegend=False
        ))
        
        fig.update_layout(
            title="Dijkstra's Algorithm - Shortest Path",
            showlegend=False,
            height=400,
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False)
        )
        
        return fig
    
    def default_visualization(self):
        """Default visualization placeholder"""
        fig = go.Figure()
        
        fig.add_trace(go.Scatter(
            x=[1, 2, 3, 4],
            y=[10, 11, 12, 13],
            mode='markers+lines',
            marker=dict(size=10, color='blue')
        ))
        
        fig.update_layout(
            title="Algorithm Visualization",
            height=400
        )
        
        return fig
    
    def render_main_content(self, controls):
        """Render the main dashboard content"""
        
        # Create tabs for different views
        tab1, tab2, tab3, tab4, tab5 = st.tabs([
            "🎯 Algorithm Playground", 
            "📊 Data Structures", 
            "🚀 Real-time Monitor",
            "📈 Performance Analytics",
            "🤖 AI Logistics Demo"
        ])
        
        with tab1:
            self.render_algorithm_playground(controls)
        
        with tab2:
            self.render_data_structures()
        
        with tab3:
            self.render_realtime_monitor()
        
        with tab4:
            self.render_performance_analytics()
        
        with tab5:
            self.render_ai_logistics_demo()
    
    def render_algorithm_playground(self, controls):
        """Render algorithm playground"""
        st.header("🎯 Algorithm Playground")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Main visualization area
            fig = self.create_algorithm_visualization(
                controls['algorithm_type'], 
                controls['algorithm']
            )
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # Control panel
            st.subheader("🎮 Controls")
            
            if st.button("▶️ Run Algorithm", type="primary"):
                st.success(f"Running {controls['algorithm']}...")
                # Add progress bar
                progress_bar = st.progress(0)
                for i in range(100):
                    time.sleep(0.01)
                    progress_bar.progress(i + 1)
                st.success("Algorithm completed!")
            
            if st.button("⏸️ Pause"):
                st.info("Algorithm paused")
            
            if st.button("🔄 Reset"):
                st.info("Algorithm reset")
            
            # Algorithm status
            st.subheader("📊 Status")
            st.markdown("""
            <div class="algorithm-status status-idle">Idle</div>
            <div class="algorithm-status status-running">Processing</div>
            <div class="algorithm-status status-completed">Completed</div>
            """, unsafe_allow_html=True)
    
    def render_data_structures(self):
        """Render data structures visualization"""
        st.header("📊 Interactive Data Structures")
        
        # Create sample visualizations for different data structures
        col1, col2 = st.columns(2)
        
        with col1:
            # Array visualization
            st.subheader("Array")
            array_data = [1, 5, 3, 9, 2, 8, 4]
            fig_array = px.bar(
                x=list(range(len(array_data))),
                y=array_data,
                title="Dynamic Array",
                color=array_data,
                color_continuous_scale="viridis"
            )
            st.plotly_chart(fig_array, use_container_width=True)
            
            # Stack visualization
            st.subheader("Stack")
            stack_data = [10, 20, 30, 40]
            fig_stack = go.Figure()
            
            for i, val in enumerate(stack_data):
                fig_stack.add_shape(
                    type="rect",
                    x0=0, y0=i, x1=1, y1=i+1,
                    fillcolor="lightblue",
                    line=dict(color="darkblue", width=2)
                )
                fig_stack.add_annotation(
                    x=0.5, y=i+0.5,
                    text=str(val),
                    showarrow=False,
                    font=dict(size=16)
                )
            
            fig_stack.update_layout(
                title="Stack (LIFO)",
                xaxis=dict(range=[0, 1], showticklabels=False),
                yaxis=dict(range=[0, len(stack_data)]),
                height=300
            )
            st.plotly_chart(fig_stack, use_container_width=True)
        
        with col2:
            # Binary Tree visualization
            st.subheader("Binary Tree")
            fig_tree = go.Figure()
            
            # Add tree nodes
            nodes_x = [0.5, 0.25, 0.75, 0.125, 0.375, 0.625, 0.875]
            nodes_y = [0.8, 0.6, 0.6, 0.4, 0.4, 0.4, 0.4]
            node_values = [50, 30, 70, 20, 40, 60, 80]
            
            # Add edges
            edges = [(0,1), (0,2), (1,3), (1,4), (2,5), (2,6)]
            for edge in edges:
                fig_tree.add_trace(go.Scatter(
                    x=[nodes_x[edge[0]], nodes_x[edge[1]]],
                    y=[nodes_y[edge[0]], nodes_y[edge[1]]],
                    mode='lines',
                    line=dict(color='gray', width=2),
                    showlegend=False
                ))
            
            # Add nodes
            fig_tree.add_trace(go.Scatter(
                x=nodes_x,
                y=nodes_y,
                mode='markers+text',
                marker=dict(size=30, color='lightgreen', line=dict(width=2, color='darkgreen')),
                text=node_values,
                textposition='middle center',
                showlegend=False
            ))
            
            fig_tree.update_layout(
                title="Binary Search Tree",
                xaxis=dict(range=[0, 1], showticklabels=False, showgrid=False),
                yaxis=dict(range=[0, 1], showticklabels=False, showgrid=False),
                height=400
            )
            st.plotly_chart(fig_tree, use_container_width=True)
    
    def render_realtime_monitor(self):
        """Render real-time monitoring"""
        st.header("🚀 Real-time Data Monitor")
        
        # Metrics row
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Active Algorithms", "3", "↑ 1")
        with col2:
            st.metric("Data Structures", "12", "↑ 2")
        with col3:
            st.metric("Operations/sec", "1,247", "↑ 15%")
        with col4:
            st.metric("Memory Usage", "45.2 MB", "↓ 2.1 MB")
        
        # Real-time charts
        col1, col2 = st.columns(2)
        
        with col1:
            # Operations timeline
            st.subheader("Operations Timeline")
            timeline_data = pd.DataFrame({
                'time': pd.date_range('2024-01-01', periods=100, freq='1s'),
                'operations': np.random.randint(50, 200, 100)
            })
            
            fig_timeline = px.line(
                timeline_data, 
                x='time', 
                y='operations',
                title="Real-time Operations"
            )
            st.plotly_chart(fig_timeline, use_container_width=True)
        
        with col2:
            # Algorithm performance
            st.subheader("Algorithm Performance")
            perf_data = pd.DataFrame({
                'Algorithm': ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble Sort'],
                'Time (ms)': [12, 15, 18, 45],
                'Memory (KB)': [256, 512, 384, 128]
            })
            
            fig_perf = px.scatter(
                perf_data,
                x='Time (ms)',
                y='Memory (KB)',
                size='Memory (KB)',
                color='Algorithm',
                title="Performance Comparison"
            )
            st.plotly_chart(fig_perf, use_container_width=True)
    
    def render_performance_analytics(self):
        """Render performance analytics"""
        st.header("📈 Performance Analytics")
        
        # Algorithm comparison
        st.subheader("Algorithm Complexity Analysis")
        
        complexity_data = pd.DataFrame({
            'Algorithm': ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble Sort', 'Selection Sort'],
            'Best Case': ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n)', 'O(n²)'],
            'Average Case': ['O(n log n)', 'O(n log n)', 'O(n log n)', 'O(n²)', 'O(n²)'],
            'Worst Case': ['O(n²)', 'O(n log n)', 'O(n log n)', 'O(n²)', 'O(n²)'],
            'Space Complexity': ['O(log n)', 'O(n)', 'O(1)', 'O(1)', 'O(1)']
        })
        
        st.dataframe(complexity_data, use_container_width=True)
        
        # Performance benchmarks
        col1, col2 = st.columns(2)
        
        with col1:
            # Execution time comparison
            exec_data = pd.DataFrame({
                'Data Size': [100, 500, 1000, 5000, 10000],
                'Quick Sort': [0.1, 0.8, 2.1, 12.5, 28.3],
                'Merge Sort': [0.2, 1.1, 2.8, 15.2, 32.1],
                'Bubble Sort': [1.2, 28.5, 112.3, 2801.2, 11205.8]
            })
            
            fig_exec = px.line(
                exec_data.melt(id_vars=['Data Size'], var_name='Algorithm', value_name='Time (ms)'),
                x='Data Size',
                y='Time (ms)',
                color='Algorithm',
                title="Execution Time vs Data Size",
                log_y=True
            )
            st.plotly_chart(fig_exec, use_container_width=True)
        
        with col2:
            # Memory usage comparison
            memory_data = pd.DataFrame({
                'Algorithm': ['Quick Sort', 'Merge Sort', 'Heap Sort', 'Bubble Sort'],
                'Memory (KB)': [256, 512, 128, 64]
            })
            
            fig_memory = px.pie(
                memory_data,
                values='Memory (KB)',
                names='Algorithm',
                title="Memory Usage Distribution"
            )
            st.plotly_chart(fig_memory, use_container_width=True)
    
    def render_ai_logistics_demo(self):
        """Render AI logistics demonstration"""
        st.header("🤖 AI Logistics Dashboard")
        st.subheader("Real-time Route Optimization & Resource Management")
        
        # Logistics metrics
        col1, col2, col3, col4 = st.columns(4)
        
        with col1:
            st.metric("Active Routes", "24", "↑ 3")
        with col2:
            st.metric("Avg Delivery Time", "18.5 min", "↓ 2.3 min")
        with col3:
            st.metric("Fuel Efficiency", "92.3%", "↑ 1.2%")
        with col4:
            st.metric("Customer Satisfaction", "4.8/5", "↑ 0.1")
        
        # Route optimization visualization
        col1, col2 = st.columns([2, 1])
        
        with col1:
            st.subheader("🗺️ Route Optimization (Dijkstra's Algorithm)")
            
            # Create a sample city map
            fig_map = go.Figure()
            
            # Add roads (edges)
            roads = [
                ([0, 1], [0, 0]), ([1, 2], [0, 1]), ([2, 3], [1, 1]),
                ([0, 1], [1, 2]), ([1, 2], [2, 2]), ([2, 3], [2, 1])
            ]
            
            for road in roads:
                fig_map.add_trace(go.Scatter(
                    x=road[0], y=road[1],
                    mode='lines',
                    line=dict(color='lightgray', width=3),
                    showlegend=False
                ))
            
            # Add delivery points
            delivery_points = {
                'Warehouse': (0, 0),
                'Store A': (1, 1),
                'Store B': (2, 2),
                'Store C': (3, 1)
            }
            
            for name, (x, y) in delivery_points.items():
                color = 'red' if name == 'Warehouse' else 'blue'
                fig_map.add_trace(go.Scatter(
                    x=[x], y=[y],
                    mode='markers+text',
                    marker=dict(size=15, color=color),
                    text=name,
                    textposition='top center',
                    showlegend=False
                ))
            
            # Highlight optimal route
            optimal_route_x = [0, 1, 2, 3]
            optimal_route_y = [0, 1, 2, 1]
            fig_map.add_trace(go.Scatter(
                x=optimal_route_x, y=optimal_route_y,
                mode='lines',
                line=dict(color='green', width=5),
                name='Optimal Route'
            ))
            
            fig_map.update_layout(
                title="Real-time Route Optimization",
                xaxis_title="Distance (km)",
                yaxis_title="Distance (km)",
                height=400
            )
            
            st.plotly_chart(fig_map, use_container_width=True)
        
        with col2:
            st.subheader("📦 Priority Queue")
            st.write("**High Priority Deliveries:**")
            
            priority_deliveries = [
                "🚨 Medical Supplies - 5 min",
                "⚡ Express Package - 12 min", 
                "📱 Electronics - 18 min",
                "📚 Books - 25 min",
                "👕 Clothing - 30 min"
            ]
            
            for delivery in priority_deliveries:
                st.write(f"• {delivery}")
            
            st.subheader("📊 Resource Allocation")
            
            # Resource usage chart
            resources = pd.DataFrame({
                'Resource': ['Trucks', 'Drivers', 'Fuel', 'Warehouses'],
                'Usage %': [85, 92, 78, 95]
            })
            
            fig_resources = px.bar(
                resources,
                x='Resource',
                y='Usage %',
                color='Usage %',
                color_continuous_scale='RdYlGn_r'
            )
            fig_resources.update_layout(height=300)
            st.plotly_chart(fig_resources, use_container_width=True)
    
    def run(self):
        """Run the main dashboard"""
        self.render_header()
        
        # Sidebar controls
        controls = self.render_sidebar()
        
        # Main content
        self.render_main_content(controls)
        
        # Footer
        st.markdown("---")
        st.markdown("🧠 **HEAL Platform** - Where Data Structures Meet Beautiful Visualization")

# Run the dashboard
if __name__ == "__main__":
    dashboard = HEALDashboard()
    dashboard.run()
