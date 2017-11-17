#description An onvolutional layer
#icon fa fa-sitemap
#param list:conv,deconv,
type = "conv"
#param int
out_channels = 32
#zone type==conv
#param int
stride = 2
#endzone

def Run(batch_input):
	out_channels = self.out_channels
	stride = self.stride

	if self.type=="conv":
		with tf.variable_scope(self.name):
			in_channels = batch_input.get_shape()[3]
			filter = tf.get_variable("filter", [4, 4, in_channels, out_channels], dtype=tf.float32, initializer=tf.random_normal_initializer(0, 0.02))
			# [batch, in_height, in_width, in_channels], [filter_width, filter_height, in_channels, out_channels]
			#	 => [batch, out_height, out_width, out_channels]
			padded_input = tf.pad(batch_input, [[0, 0], [1, 1], [1, 1], [0, 0]], mode="CONSTANT")
			conv = tf.nn.conv2d(padded_input, filter, [1, stride, stride, 1], padding="VALID")
			return conv
	else:
		with tf.variable_scope(self.name):
			batch, in_height, in_width, in_channels = [int(d) for d in batch_input.get_shape()]
			filter = tf.get_variable("filter", [4, 4, out_channels, in_channels], dtype=tf.float32, initializer=tf.random_normal_initializer(0, 0.02))
			# [batch, in_height, in_width, in_channels], [filter_width, filter_height, out_channels, in_channels]
			#	 => [batch, out_height, out_width, out_channels]
			conv = tf.nn.conv2d_transpose(batch_input, filter, [batch, in_height * 2, in_width * 2, out_channels], [1, 2, 2, 1], padding="SAME")
			return conv