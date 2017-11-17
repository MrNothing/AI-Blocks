import tensorflow as tf

#description A simple multi-layered perceptron
#icon fa fa-code-fork

#param bool
use_name = False

#param array|eval
hidden_units = [1024, 256, 10]


self.name = self.name.replace(" ", "_")
self.init()

def init(self):
	self.total_weights = 0

	self.variables = []
	for u in range(len(self.hidden_units)-1):  
		i = u+1
		if self.use_name==False:
			W = tf.Variable(self.xavier_init([self.hidden_units[i-1], self.hidden_units[i]]))
			b = tf.Variable(tf.zeros(shape=[self.hidden_units[i]]))
		else:
			W = tf.Variable(self.xavier_init([self.hidden_units[i-1], self.hidden_units[i]]), name=self.name+"_W_"+str(u))
			b = tf.Variable(tf.zeros(shape=[self.hidden_units[i]]), name=self.name+"_W_"+str(u))
		
		self.total_weights+=self.hidden_units[i-1]+self.hidden_units[i]*2
		self.variables.append(W)
		self.variables.append(b)

def xavier_init(self, size):
	in_dim = size[0]
	xavier_stddev = 1. / tf.sqrt(in_dim / 2.)
	return tf.random_normal(shape=size, stddev=xavier_stddev)

def Run(self, h, reuse=False):
	for i in range(int(len(self.variables)/2)):
		W=self.variables[i*2]
		b=self.variables[i*2+1]
		h = tf.matmul(h, W) + b
		Log(h.name+" "+str(h.get_shape()))

	Log(h.name+" "+str(h.get_shape()))
	return h