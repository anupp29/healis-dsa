import numpy as np

class MDP:
    def __init__(self, states, actions, transitions, rewards, gamma=0.9):
        """
        states: list of states
        actions: list of actions
        transitions: dict {(state, action): [(prob, next_state), ...]}
        rewards: dict {(state, action, next_state): reward}
        gamma: discount factor
        """
        self.states = states
        self.actions = actions
        self.transitions = transitions
        self.rewards = rewards
        self.gamma = gamma
    
    def value_iteration(self, epsilon=0.01):
        """Value Iteration algorithm"""
        V = {s: 0 for s in self.states}
        
        while True:
            delta = 0
            new_V = V.copy()
            
            for s in self.states:
                action_values = []
                
                for a in self.actions:
                    if (s, a) not in self.transitions:
                        continue
                    
                    value = 0
                    for prob, next_state in self.transitions[(s, a)]:
                        reward = self.rewards.get((s, a, next_state), 0)
                        value += prob * (reward + self.gamma * V[next_state])
                    
                    action_values.append(value)
                
                if action_values:
                    new_V[s] = max(action_values)
                
                delta = max(delta, abs(new_V[s] - V[s]))
            
            V = new_V
            
            if delta < epsilon:
                break
        
        # Extract policy
        policy = {}
        for s in self.states:
            action_values = {}
            
            for a in self.actions:
                if (s, a) not in self.transitions:
                    continue
                
                value = 0
                for prob, next_state in self.transitions[(s, a)]:
                    reward = self.rewards.get((s, a, next_state), 0)
                    value += prob * (reward + self.gamma * V[next_state])
                
                action_values[a] = value
            
            if action_values:
                policy[s] = max(action_values, key=action_values.get)
        
        return V, policy