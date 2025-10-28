"""
HEAL Platform - Interactive Visualization Engine
Super interactive, real-time DSA visualizations with perfect user experience
"""
import streamlit as st
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
import pandas as pd
import numpy as np
import time
import asyncio
import threading
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional, Callable
import json

from ..core.advanced_dsa_engine import (
    PerfectSortingEngine, PerfectSearchEngine, PerfectGraphEngine, 
    PerfectDynamicProgramming, ComplexityAnalyzer
)
from ..data_bridge.realtime_sync import RealTimeMongoSync, DataStructureUpdater, DatabaseChange

class InteractiveVisualizationEngine:
    """Perfect interactive visualization engine with real-time updates"""
    
    def __init__(self):
        self.current_algorithm = None
        self.visualization_data = {}
        self.animation_speed = 1.0
        self.is_playing = False
        self.step_index = 0
        self.operation_history = []
        self.real_time_sync = None
        self.data_updater = None
        
        # Initialize session state
        self._initialize_session_state()
    
    def _initialize_session_state(self):
        """Initialize Streamlit session state"""
        if 'viz_data' not in st.session_state:
            st.session_state.viz_data = {}
        if 'algorithm_state' not in st.session_state:
            st.session_state.algorithm_state = 'idle'
        if 'operation_count' not in st.session_state:
            st.session_state.operation_count = 0
        if 'real_time_updates' not in st.session_state:
            st.session_state.real_time_updates = []
    
    def create_perfect_sorting_visualization(self, algorithm: str, data: List[int]) -> go.Figure:
        """Create perfect sorting visualization with step-by-step animation"""
        
        def visualizer_callback(step_data):
            """Callback for algorithm steps"""
            self.operation_history.append(step_data)
            st.session_state.operation_count += 1
        
        # Initialize sorting engine
        sorting_engine = PerfectSortingEngine(visualizer_callback)
        
        # Create figure
        fig = go.Figure()
        
        # Add initial bars
        colors = ['#FF6B6B' if i in step_data.get('indices', []) else '#4ECDC4' 
                 for i in range(len(data))]
        
        fig.add_trace(go.Bar(
            x=list(range(len(data))),
            y=data,
            marker_color=colors,
            text=data,
            textposition='auto',
            name='Array Elements'
        ))
        
        # Add comparison indicators
        if 'indices' in step_data and len(step_data['indices']) >= 2:
            for i in step_data['indices'][:2]:
                fig.add_shape(
                    type="rect",
                    x0=i-0.4, y0=0, x1=i+0.4, y1=max(data)*1.1,
                    line=dict(color="red", width=3),
                    fillcolor="rgba(255,0,0,0.1)"
                )
        
        # Update layout
        fig.update_layout(
            title=f"{algorithm} - Step {self.step_index + 1}",
            xaxis_title="Index",
            yaxis_title="Value",
            showlegend=False,
            height=400,
            annotations=[
                dict(
                    x=0.5, y=1.15,
                    xref='paper', yref='paper',
                    text=f"Operations: {st.session_state.operation_count} | "
                         f"Comparisons: {step_data.get('metrics', {}).get('comparisons', 0)} | "
                         f"Swaps: {step_data.get('metrics', {}).get('swaps', 0)}",
                    showarrow=False,
                    font=dict(size=12)
                )
            ]
        )
        
        return fig
    
    def create_perfect_graph_visualization(self, algorithm: str, graph_data: Dict) -> go.Figure:
        """Create perfect graph algorithm visualization"""
        
        fig = go.Figure()
        
        # Extract nodes and edges from graph data
        nodes = list(graph_data.keys())
        edges = []
        
        for node, neighbors in graph_data.items():
            for neighbor, weight in neighbors:
                edges.append((node, neighbor, weight))
        
        # Create node positions (circular layout for simplicity)
        n_nodes = len(nodes)
        angles = np.linspace(0, 2*np.pi, n_nodes, endpoint=False)
        node_positions = {
            node: (np.cos(angle), np.sin(angle))
            for node, angle in zip(nodes, angles)
        }
        
        # Add edges
        for edge in edges:
            from_node, to_node, weight = edge
            x0, y0 = node_positions[from_node]
            x1, y1 = node_positions[to_node]
            
            fig.add_trace(go.Scatter(
                x=[x0, x1, None],
                y=[y0, y1, None],
                mode='lines',
                line=dict(width=2, color='gray'),
                showlegend=False,
                hoverinfo='none'
            ))
            
            # Add weight labels
            mid_x, mid_y = (x0 + x1) / 2, (y0 + y1) / 2
            fig.add_annotation(
                x=mid_x, y=mid_y,
                text=str(weight),
                showarrow=False,
                font=dict(size=10, color='blue'),
                bgcolor='white',
                bordercolor='blue',
                borderwidth=1
            )
        
        # Add nodes
        node_x = [node_positions[node][0] for node in nodes]
        node_y = [node_positions[node][1] for node in nodes]
        
        fig.add_trace(go.Scatter(
            x=node_x,
            y=node_y,
            mode='markers+text',
            marker=dict(
                size=30,
                color='lightblue',
                line=dict(width=2, color='darkblue')
            ),
            text=nodes,
            textposition='middle center',
            showlegend=False
        ))
        
        fig.update_layout(
            title=f"{algorithm} Visualization",
            showlegend=False,
            height=500,
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False)
        )
        
        return fig
    
    def create_perfect_tree_visualization(self, tree_data: Dict) -> go.Figure:
        """Create perfect binary tree visualization"""
        
        fig = go.Figure()
        
        def add_tree_nodes(node_data, x, y, level_width):
            """Recursively add tree nodes and edges"""
            if not node_data:
                return
            
            # Add current node
            fig.add_trace(go.Scatter(
                x=[x],
                y=[y],
                mode='markers+text',
                marker=dict(
                    size=25,
                    color='lightgreen',
                    line=dict(width=2, color='darkgreen')
                ),
                text=[str(node_data['data'])],
                textposition='middle center',
                showlegend=False
            ))
            
            # Add left child
            if node_data.get('left'):
                left_x = x - level_width
                left_y = y - 1
                
                # Add edge
                fig.add_trace(go.Scatter(
                    x=[x, left_x],
                    y=[y, left_y],
                    mode='lines',
                    line=dict(width=2, color='gray'),
                    showlegend=False
                ))
                
                add_tree_nodes(node_data['left'], left_x, left_y, level_width / 2)
            
            # Add right child
            if node_data.get('right'):
                right_x = x + level_width
                right_y = y - 1
                
                # Add edge
                fig.add_trace(go.Scatter(
                    x=[x, right_x],
                    y=[y, right_y],
                    mode='lines',
                    line=dict(width=2, color='gray'),
                    showlegend=False
                ))
                
                add_tree_nodes(node_data['right'], right_x, right_y, level_width / 2)
        
        if tree_data:
            add_tree_nodes(tree_data, 0, 0, 2)
        
        fig.update_layout(
            title="Binary Tree Visualization",
            showlegend=False,
            height=400,
            xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
            yaxis=dict(showgrid=False, zeroline=False, showticklabels=False)
        )
        
        return fig
    
    def create_perfect_dp_table(self, dp_data: Dict) -> go.Figure:
        """Create perfect dynamic programming table visualization"""
        
        dp_table = dp_data.get('dp_table', [])
        if not dp_table:
            return go.Figure()
        
        # Convert to numpy array for easier handling
        table_array = np.array(dp_table)
        
        fig = go.Figure(data=go.Heatmap(
            z=table_array,
            colorscale='Viridis',
            showscale=True,
            text=table_array,
            texttemplate="%{text}",
            textfont={"size": 10}
        ))
        
        fig.update_layout(
            title="Dynamic Programming Table",
            xaxis_title="j",
            yaxis_title="i",
            height=400
        )
        
        return fig
    
    def create_real_time_metrics_dashboard(self) -> go.Figure:
        """Create real-time performance metrics dashboard"""
        
        # Create subplots
        fig = make_subplots(
            rows=2, cols=2,
            subplot_titles=('Operations/Second', 'Memory Usage', 'Algorithm Progress', 'Database Changes'),
            specs=[[{"secondary_y": False}, {"secondary_y": False}],
                   [{"secondary_y": False}, {"secondary_y": False}]]
        )
        
        # Generate sample real-time data
        timestamps = pd.date_range(start='now', periods=50, freq='1s')
        operations_per_sec = np.random.randint(100, 1000, 50)
        memory_usage = np.random.randint(10, 100, 50)
        
        # Operations per second
        fig.add_trace(
            go.Scatter(
                x=timestamps,
                y=operations_per_sec,
                mode='lines+markers',
                name='Ops/Sec',
                line=dict(color='blue', width=2)
            ),
            row=1, col=1
        )
        
        # Memory usage
        fig.add_trace(
            go.Scatter(
                x=timestamps,
                y=memory_usage,
                mode='lines+markers',
                name='Memory (MB)',
                line=dict(color='red', width=2),
                fill='tonexty'
            ),
            row=1, col=2
        )
        
        # Algorithm progress (pie chart)
        progress_data = ['Completed', 'In Progress', 'Pending']
        progress_values = [60, 25, 15]
        
        fig.add_trace(
            go.Pie(
                labels=progress_data,
                values=progress_values,
                name="Progress"
            ),
            row=2, col=1
        )
        
        # Database changes (bar chart)
        db_changes = ['Inserts', 'Updates', 'Deletes']
        change_counts = [45, 23, 8]
        
        fig.add_trace(
            go.Bar(
                x=db_changes,
                y=change_counts,
                name="DB Changes",
                marker_color=['green', 'orange', 'red']
            ),
            row=2, col=2
        )
        
        fig.update_layout(
            height=600,
            showlegend=False,
            title_text="Real-time Performance Dashboard"
        )
        
        return fig
    
    def create_interactive_controls(self) -> Dict[str, Any]:
        """Create interactive control panel"""
        
        st.sidebar.header("🎮 Interactive Controls")
        
        # Algorithm execution controls
        col1, col2, col3 = st.sidebar.columns(3)
        
        with col1:
            play_button = st.button("▶️", help="Play/Resume")
        with col2:
            pause_button = st.button("⏸️", help="Pause")
        with col3:
            reset_button = st.button("🔄", help="Reset")
        
        # Speed control
        speed = st.sidebar.slider(
            "Animation Speed",
            min_value=0.1,
            max_value=5.0,
            value=1.0,
            step=0.1,
            help="Control animation speed"
        )
        
        # Step control
        step_mode = st.sidebar.checkbox("Step Mode", help="Execute one step at a time")
        
        if step_mode:
            step_button = st.sidebar.button("Next Step", help="Execute next step")
        else:
            step_button = False
        
        # Data input
        st.sidebar.subheader("📊 Data Input")
        
        data_source = st.sidebar.selectbox(
            "Data Source",
            ["Manual Input", "Random Generation", "MongoDB Live", "File Upload"]
        )
        
        if data_source == "Manual Input":
            data_input = st.sidebar.text_input(
                "Enter data (comma-separated)",
                value="64,34,25,12,22,11,90"
            )
            try:
                data = [int(x.strip()) for x in data_input.split(',')]
            except:
                data = [64,34,25,12,22,11,90]
        
        elif data_source == "Random Generation":
            size = st.sidebar.slider("Array Size", 5, 100, 20)
            min_val = st.sidebar.number_input("Min Value", value=1)
            max_val = st.sidebar.number_input("Max Value", value=100)
            
            if st.sidebar.button("Generate Random Data"):
                data = np.random.randint(min_val, max_val, size).tolist()
                st.session_state.random_data = data
            
            data = getattr(st.session_state, 'random_data', [64,34,25,12,22,11,90])
        
        else:
            data = [64,34,25,12,22,11,90]  # Default data
        
        # Real-time monitoring
        st.sidebar.subheader("📡 Real-time Monitoring")
        
        enable_realtime = st.sidebar.checkbox(
            "Enable Real-time Updates",
            value=True,
            help="Monitor database changes in real-time"
        )
        
        if enable_realtime:
            update_interval = st.sidebar.slider(
                "Update Interval (seconds)",
                min_value=1,
                max_value=60,
                value=5
            )
        else:
            update_interval = 30
        
        return {
            'play': play_button,
            'pause': pause_button,
            'reset': reset_button,
            'speed': speed,
            'step_mode': step_mode,
            'step': step_button,
            'data': data,
            'data_source': data_source,
            'enable_realtime': enable_realtime,
            'update_interval': update_interval
        }
    
    def render_algorithm_comparison_table(self) -> None:
        """Render comprehensive algorithm comparison table"""
        
        st.subheader("📊 Algorithm Complexity Analysis")
        
        # Comprehensive algorithm data
        algorithms_data = {
            'Algorithm': [
                'Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort',
                'Quick Sort', 'Heap Sort', 'Radix Sort', 'Counting Sort',
                'Linear Search', 'Binary Search', 'Hash Table Lookup',
                'BFS', 'DFS', 'Dijkstra', 'A*', 'Bellman-Ford'
            ],
            'Best Case': [
                'O(n)', 'O(n²)', 'O(n)', 'O(n log n)',
                'O(n log n)', 'O(n log n)', 'O(nk)', 'O(n+k)',
                'O(1)', 'O(1)', 'O(1)',
                'O(V+E)', 'O(V+E)', 'O(V log V + E)', 'O(b^d)', 'O(VE)'
            ],
            'Average Case': [
                'O(n²)', 'O(n²)', 'O(n²)', 'O(n log n)',
                'O(n log n)', 'O(n log n)', 'O(nk)', 'O(n+k)',
                'O(n)', 'O(log n)', 'O(1)',
                'O(V+E)', 'O(V+E)', 'O(V log V + E)', 'O(b^d)', 'O(VE)'
            ],
            'Worst Case': [
                'O(n²)', 'O(n²)', 'O(n²)', 'O(n log n)',
                'O(n²)', 'O(n log n)', 'O(nk)', 'O(n+k)',
                'O(n)', 'O(log n)', 'O(n)',
                'O(V+E)', 'O(V+E)', 'O(V²)', 'O(b^d)', 'O(VE)'
            ],
            'Space Complexity': [
                'O(1)', 'O(1)', 'O(1)', 'O(n)',
                'O(log n)', 'O(1)', 'O(n+k)', 'O(k)',
                'O(1)', 'O(1)', 'O(n)',
                'O(V)', 'O(V)', 'O(V)', 'O(b^d)', 'O(V)'
            ],
            'Stable': [
                'Yes', 'No', 'Yes', 'Yes',
                'No', 'No', 'Yes', 'Yes',
                'N/A', 'N/A', 'N/A',
                'N/A', 'N/A', 'N/A', 'N/A', 'N/A'
            ],
            'In-Place': [
                'Yes', 'Yes', 'Yes', 'No',
                'Yes', 'Yes', 'No', 'No',
                'N/A', 'N/A', 'N/A',
                'N/A', 'N/A', 'N/A', 'N/A', 'N/A'
            ]
        }
        
        df = pd.DataFrame(algorithms_data)
        
        # Style the dataframe
        styled_df = df.style.apply(self._highlight_complexity, axis=1)
        
        st.dataframe(styled_df, use_container_width=True, height=600)
    
    def _highlight_complexity(self, row):
        """Highlight complexity based on efficiency"""
        colors = []
        
        for col in row.index:
            if col in ['Best Case', 'Average Case', 'Worst Case']:
                complexity = row[col]
                if 'O(1)' in complexity or 'O(log' in complexity:
                    colors.append('background-color: #90EE90')  # Light green
                elif 'O(n)' in complexity and 'log' not in complexity and '²' not in complexity:
                    colors.append('background-color: #FFFFE0')  # Light yellow
                elif 'O(n²)' in complexity or 'O(VE)' in complexity:
                    colors.append('background-color: #FFB6C1')  # Light red
                else:
                    colors.append('background-color: #E0E0E0')  # Light gray
            else:
                colors.append('')
        
        return colors
    
    def render_real_time_updates_panel(self):
        """Render real-time database updates panel"""
        
        st.subheader("📡 Real-time Database Updates")
        
        # Create placeholder for updates
        updates_placeholder = st.empty()
        
        # Display recent updates
        if st.session_state.real_time_updates:
            with updates_placeholder.container():
                for i, update in enumerate(st.session_state.real_time_updates[-10:]):
                    timestamp = update.get('timestamp', 'Unknown')
                    change_type = update.get('change_type', 'Unknown')
                    collection = update.get('collection', 'Unknown')
                    database = update.get('database', 'Unknown')
                    
                    # Color code by change type
                    if change_type == 'insert':
                        color = '🟢'
                    elif change_type == 'update':
                        color = '🟡'
                    elif change_type == 'delete':
                        color = '🔴'
                    else:
                        color = '⚪'
                    
                    st.write(f"{color} **{change_type.upper()}** in `{database}.{collection}` at {timestamp}")
        else:
            st.info("No real-time updates detected yet. Insert data into MongoDB to see live updates!")
    
    def initialize_real_time_sync(self, healis_uri: str, admin_uri: str):
        """Initialize real-time MongoDB synchronization"""
        try:
            self.real_time_sync = RealTimeMongoSync(healis_uri, admin_uri)
            
            # Add change listener
            def handle_change(change: DatabaseChange):
                # Add to session state for display
                update_info = {
                    'timestamp': change.timestamp.strftime('%H:%M:%S'),
                    'change_type': change.change_type.value,
                    'collection': change.collection,
                    'database': change.database,
                    'document_id': change.document_id
                }
                
                if 'real_time_updates' not in st.session_state:
                    st.session_state.real_time_updates = []
                
                st.session_state.real_time_updates.append(update_info)
                
                # Keep only last 50 updates
                if len(st.session_state.real_time_updates) > 50:
                    st.session_state.real_time_updates = st.session_state.real_time_updates[-50:]
            
            self.real_time_sync.add_change_listener(handle_change)
            
            # Connect and start monitoring
            connection_results = self.real_time_sync.connect()
            if any(connection_results.values()):
                self.real_time_sync.start_monitoring()
                return True
            
        except Exception as e:
            st.error(f"Failed to initialize real-time sync: {e}")
        
        return False
