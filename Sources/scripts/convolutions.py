#description An 2D convolutional layer
#icon fa fa-sitemap
#param list:conv2d,deconv2d,maxpool2d
type = "conv2d"
#zone type==conv2d
#param array|int
shape = [5, 5, 1, 32]
#param int
strides = 1
#endzone

#zone type==maxpool2d
#param int
k = 2
#endzone

self.variables = []

def Run(self, batch_input, reuse=False):
	
	if self.type=="conv2d":
		W = tf.Variable(tf.random_normal(self.shape))
		b = tf.Variable(tf.random_normal([self.shape[3]]))

		self.variables.append(W)
		self.variables.append(b)
		
		x =  self.conv2d(batch_input, W, b, strides=self.strides, name=self.name)
		Log(self.name+" "+str(x.get_shape()))
		return x
	elif self.type=="maxpool2d":
		x = self.maxpool2d(batch_input, k=self.k, name=self.name)
		Log(self.name+" "+str(x.get_shape()))
		return x
	else:
		stride = self.strides
		out_channels = self.out_channels
		with tf.variable_scope(self.name):
			batch, in_height, in_width, in_channels = [int(d) for d in batch_input.get_shape()]
			filter = tf.get_variable("filter", [4, 4, out_channels, in_channels], dtype=tf.float32, initializer=tf.random_normal_initializer(0, 0.02))
			# [batch, in_height, in_width, in_channels], [filter_width, filter_height, out_channels, in_channels]
			#	 => [batch, out_height, out_width, out_channels]
			conv = tf.nn.conv2d_transpose(batch_input, filter, [batch, in_height * 2, in_width * 2, out_channels], [1, 2, 2, 1], padding="SAME")
			return conv

def conv2d(self, x, W, b, strides=1, name=""):
	# Conv2D wrapper, with bias and relu activation
	x = tf.nn.conv2d(x, W, strides=[1, strides, strides, 1], padding='SAME', name=name)
	x = tf.nn.bias_add(x, b)
	return tf.nn.relu(x)

def maxpool2d(self, x, k=2, name=""):
	# MaxPool2D wrapper
	return tf.nn.max_pool(x, ksize=[1, k, k, 1], strides=[1, k, k, 1], padding='SAME', name=name)