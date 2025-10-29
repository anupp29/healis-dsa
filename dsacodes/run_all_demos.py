import sys
import os

def run_demo(module_name, demo_function):
    try:
        print(f"\n{'='*80}")
        print(f"RUNNING: {module_name.upper().replace('_', ' ')} DEMO")
        print(f"{'='*80}")
        
        if module_name == "priority_queue":
            from priority_queue import emergency_triage_system
            emergency_triage_system()
            
        elif module_name == "binary_search_tree":
            from binary_search_tree import patient_record_management
            patient_record_management()
            
        elif module_name == "hash_table":
            from hash_table import patient_database_system
            patient_database_system()
            
        elif module_name == "dijkstra_pathfinding":
            from dijkstra_pathfinding import hospital_navigation_system
            hospital_navigation_system()
            
        elif module_name == "sorting_algorithms":
            from sorting_algorithms import patient_data_sorting
            patient_data_sorting()
            
        elif module_name == "queue_stack":
            from queue_stack import appointment_queue_system, medical_records_stack_system
            appointment_queue_system()
            print("\n" + "="*50)
            medical_records_stack_system()
            
        elif module_name == "graph_network":
            from graph_network import hospital_network_analysis
            hospital_network_analysis()
            
        print(f"\n✅ {module_name.upper().replace('_', ' ')} DEMO COMPLETED SUCCESSFULLY!")
        
    except Exception as e:
        print(f"\n❌ ERROR in {module_name}: {str(e)}")

def main():
    print("🏥 HEALIS DSA VISUALIZATION - PYTHON IMPLEMENTATIONS")
    print("=" * 80)
    print("Perfect humanized implementations of all DSA algorithms")
    print("Medical context • No comments • Production ready")
    print("=" * 80)
    
    demos = [
        ("priority_queue", "Emergency Triage System - Min Heap Priority Queue"),
        ("binary_search_tree", "Patient Record Management - BST Operations"),
        ("hash_table", "Patient Database - Hash Table with Collision Handling"),
        ("dijkstra_pathfinding", "Hospital Navigation - Dijkstra's Shortest Path"),
        ("sorting_algorithms", "Patient Data Sorting - Multiple Algorithms"),
        ("queue_stack", "Appointment Queue & Medical Records Stack"),
        ("graph_network", "Hospital Network Analysis - Graph Algorithms")
    ]
    
    print("\nAvailable Demos:")
    for i, (module, description) in enumerate(demos, 1):
        print(f"{i}. {description}")
    
    print(f"\n{len(demos) + 1}. Run All Demos")
    print(f"{len(demos) + 2}. Exit")
    
    while True:
        try:
            choice = input(f"\nSelect demo (1-{len(demos) + 2}): ").strip()
            
            if choice == str(len(demos) + 2):
                print("\n👋 Thank you for exploring HEALIS DSA implementations!")
                break
                
            elif choice == str(len(demos) + 1):
                print("\n🚀 Running all demos sequentially...")
                for module, description in demos:
                    input(f"\nPress Enter to run: {description}")
                    run_demo(module, description)
                    
                print(f"\n🎉 ALL DEMOS COMPLETED! Perfect DSA implementations showcased.")
                break
                
            elif choice.isdigit() and 1 <= int(choice) <= len(demos):
                module, description = demos[int(choice) - 1]
                run_demo(module, description)
                
                continue_choice = input("\nRun another demo? (y/n): ").strip().lower()
                if continue_choice != 'y':
                    break
                    
            else:
                print("❌ Invalid choice. Please try again.")
                
        except KeyboardInterrupt:
            print("\n\n👋 Demo interrupted. Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()
