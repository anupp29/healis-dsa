from dataclasses import dataclass
from typing import Optional

@dataclass
class TreeNode:
    value: int
    left: Optional['TreeNode'] = None
    right: Optional['TreeNode'] = None
    
class BinarySearchTree:
    def __init__(self):
        self.root: Optional[TreeNode] = None
        self.operations = 0
        self.comparisons = 0
        
    def insert(self, value: int):
        self.root = self._insert_recursive(self.root, value)
        self.operations += 1
        
    def _insert_recursive(self, node: Optional[TreeNode], value: int) -> TreeNode:
        if not node:
            return TreeNode(value)
            
        self.comparisons += 1
        if value == node.value:
            return node
            
        if value < node.value:
            node.left = self._insert_recursive(node.left, value)
        else:
            node.right = self._insert_recursive(node.right, value)
            
        return node
        
    def search(self, value: int) -> bool:
        return self._search_recursive(self.root, value)
        
    def _search_recursive(self, node: Optional[TreeNode], value: int) -> bool:
        if not node:
            return False
            
        self.comparisons += 1
        if value == node.value:
            return True
        elif value < node.value:
            return self._search_recursive(node.left, value)
        else:
            return self._search_recursive(node.right, value)
            
    def delete(self, value: int):
        self.root = self._delete_recursive(self.root, value)
        self.operations += 1
        
    def _delete_recursive(self, node: Optional[TreeNode], value: int) -> Optional[TreeNode]:
        if not node:
            return None
            
        if value < node.value:
            node.left = self._delete_recursive(node.left, value)
        elif value > node.value:
            node.right = self._delete_recursive(node.right, value)
        else:
            if not node.left:
                return node.right
            if not node.right:
                return node.left
                
            min_right = self._find_min(node.right)
            node.value = min_right.value
            node.right = self._delete_recursive(node.right, min_right.value)
            
        return node
        
    def _find_min(self, node: TreeNode) -> TreeNode:
        while node.left:
            node = node.left
        return node
        
    def _find_max(self, node: TreeNode) -> TreeNode:
        while node.right:
            node = node.right
        return node
        
    def calculate_height(self, node: Optional[TreeNode] = None) -> int:
        if node is None:
            node = self.root
        if not node:
            return 0
        return 1 + max(self.calculate_height(node.left), self.calculate_height(node.right))
        
    def count_nodes(self, node: Optional[TreeNode] = None) -> int:
        if node is None:
            node = self.root
        if not node:
            return 0
        return 1 + self.count_nodes(node.left) + self.count_nodes(node.right)
        
    def is_valid_bst(self, node: Optional[TreeNode] = None, min_val: float = float('-inf'), max_val: float = float('inf')) -> bool:
        if node is None:
            node = self.root
        if not node:
            return True
        if node.value <= min_val or node.value >= max_val:
            return False
        return (self.is_valid_bst(node.left, min_val, node.value) and 
                self.is_valid_bst(node.right, node.value, max_val))
                
    def inorder_traversal(self, node: Optional[TreeNode] = None) -> list:
        if node is None:
            node = self.root
        result = []
        if node:
            result.extend(self.inorder_traversal(node.left))
            result.append(node.value)
            result.extend(self.inorder_traversal(node.right))
        return result
        
    def preorder_traversal(self, node: Optional[TreeNode] = None) -> list:
        if node is None:
            node = self.root
        result = []
        if node:
            result.append(node.value)
            result.extend(self.preorder_traversal(node.left))
            result.extend(self.preorder_traversal(node.right))
        return result
        
    def postorder_traversal(self, node: Optional[TreeNode] = None) -> list:
        if node is None:
            node = self.root
        result = []
        if node:
            result.extend(self.postorder_traversal(node.left))
            result.extend(self.postorder_traversal(node.right))
            result.append(node.value)
        return result

def patient_record_management():
    bst = BinarySearchTree()
    patient_ids = [150, 75, 200, 50, 100, 175, 250, 25, 60, 90, 110]
    
    print("Patient Record Management System - BST Implementation")
    print("=" * 60)
    
    for patient_id in patient_ids:
        bst.insert(patient_id)
        print(f"Registered Patient ID: {patient_id}")
    
    print(f"\nTree Statistics:")
    print(f"Total Patients: {bst.count_nodes()}")
    print(f"Tree Height: {bst.calculate_height()}")
    print(f"Valid BST: {bst.is_valid_bst()}")
    print(f"Operations: {bst.operations}")
    print(f"Comparisons: {bst.comparisons}")
    
    search_ids = [100, 300, 75]
    print(f"\nSearching for Patient IDs:")
    for patient_id in search_ids:
        found = bst.search(patient_id)
        print(f"Patient ID {patient_id}: {'Found' if found else 'Not Found'}")
    
    print(f"\nPatient IDs (Sorted): {bst.inorder_traversal()}")
    
    delete_id = 75
    print(f"\nDeleting Patient ID: {delete_id}")
    bst.delete(delete_id)
    print(f"Updated Patient IDs: {bst.inorder_traversal()}")

if __name__ == "__main__":
    patient_record_management()
