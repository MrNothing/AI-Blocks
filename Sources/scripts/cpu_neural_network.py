import numpy as np
import random as rand
#description Empty script template
#icon fa fa-flask

#param array|int
hidden_units = []

self.weights = []
self.biais = []

self.init()

def init(self):
    for u in range(len(self.hidden_units)-1):  
        i = u+1

        w0 = []
        for j in range(self.hidden_units[i-1]):
            w0.append(rand.uniform(0, 1))
        
        w1 = []
        for j in range(self.hidden_units[i]):
            w1.append(rand.uniform(0, 1))

        b = []
        for j in range(self.hidden_units[i]):
            b.append(rand.uniform(0, 1))

        self.weights.append([w0, w1])
        self.biais.append(b)
        Log("["+str(self.hidden_units[i-1])+"] => ["+str(self.hidden_units[i])+"]")

def Run(self, h):
    for i in range(len(self.weights)):
        h = self.add(self.matmul(h, self.weights[i]), self.biais[i])
    return h

def add(self, x, b):
    if(len(x)!=len(b)):
        raise Exception("different array size: ["+str(len(x))+"] ["+str(len(b))+"]")
    val = []
    for i in range(len(x)):
        val.append(x[i]+b[i])
    return val
    
def matmul(self, x, w):
    if(len(x)!=len(w[0])):
        raise Exception("different array size: ["+str(len(x))+"] ["+str(len(w[0]))+"]")
    else:
        _sum = 0
        for i in range(len(x)):
            _sum+=(x[i]*w[0][i])
        
        _sum = self.sigmoid(_sum)

        output = []
        for i in range(len(w[1])):
            output.append(self.sigmoid(_sum*w[1][i]))
        return output

def sigmoid(self, x):
    return 1/(1+np.exp(-x))

def relu(self, x):
    return max(0.000001, x)

def getValues(self):
	return [self.weights, self.biais]

def setValues(self, values):
    self.weights = values[0]
    self.biais = values[1]