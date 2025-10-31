class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False
        self.frequency = 0

class Trie:
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word):  # O(L) where L is word length
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end_of_word = True
        node.frequency += 1
    
    def search(self, word):  # O(L)
        node = self.root
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.is_end_of_word
    
    def starts_with(self, prefix):  # Prefix search O(L)
        node = self.root
        for char in prefix:
            if char not in node.children:
                return False
            node = node.children[char]
        return True
    
    def autocomplete(self, prefix):  # Auto-complete
        node = self.root
        for char in prefix:
            if char not in node.children:
                return []
            node = node.children[char]
        
        return self._collect_words(node, prefix)
    
    def _collect_words(self, node, prefix):
        words = []
        if node.is_end_of_word:
            words.append(prefix)
        
        for char, child_node in node.children.items():
            words.extend(self._collect_words(child_node, prefix + char))
        
        return words