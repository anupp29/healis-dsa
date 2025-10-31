def linear_search(arr, target):  # O(N)
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1

# Text matching using linear search
def text_search(text, pattern):  # O(N * M)
    n = len(text)
    m = len(pattern)
    
    for i in range(n - m + 1):
        j = 0
        while j < m and text[i + j] == pattern[j]:
            j += 1
        if j == m:
            return i
    
    return -1