import tensorflow as tf

#description Activation functions: softmax, relu, tanh, sigmoid etc...
#icon fa fa-flask

#param list: sigmoid, tanh, softmax, relu, batchnorm, lrelu
function = "sigmoid"
#zone function==lrelu
#param float
a = 1
#endzone

def Run(self, x):
	Log(self.function)

	if self.function=="sigmoid":
		return tf.nn.sigmoid(x)
	elif self.function=="tanh":
		return tf.nn.tanh(x)
	elif self.function=="softmax":
		return tf.nn.softmax(x)
	elif self.function=="batchnorm":
		return self.batchnorm(x)
	elif self.function=="lrelu":
		return self.lrelu(x)
	else:
		return tf.nn.relu(x)

def batchnorm(input):
	with tf.variable_scope(self.name):
		# this block looks like it has 3 inputs on the graph unless we do this
		input = tf.identity(input)

		channels = input.get_shape()[3]
		offset = tf.get_variable("offset", [channels], dtype=tf.float32, initializer=tf.zeros_initializer())
		scale = tf.get_variable("scale", [channels], dtype=tf.float32, initializer=tf.random_normal_initializer(1.0, 0.02))
		mean, variance = tf.nn.moments(input, axes=[0, 1, 2], keep_dims=False)
		variance_epsilon = 1e-5
		normalized = tf.nn.batch_normalization(input, mean, variance, offset, scale, variance_epsilon=variance_epsilon)
		return normalized

def lrelu(x):
	a = self.a
	with tf.name_scope(self.name):
		# adding these together creates the leak part and linear part
		# then cancels them out by subtracting/adding an absolute value term
		# leak: a*x/2 - a*abs(x)/2
		# linear: x/2 + abs(x)/2

		# this block looks like it has 2 inputs on the graph unless we do this
		x = tf.identity(x)
	return (0.5 * (1 + a)) * x + (0.5 * (1 - a)) * tf.abs(x)