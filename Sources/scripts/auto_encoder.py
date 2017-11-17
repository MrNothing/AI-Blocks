#description An auto-encoder trainer
#icon glyphicon glyphicon-random
#MAIN=Run

#param list:Training,Encoding,Decoding
mode = "Training"

#param object
_input = None
#param object
Encoder = None
#param object
Decoder = None

#param float
learning_rate = 0.0001
#param int
training_iterations = 3000	
#param int
display_step = 100
#param folder
save_path = ""
#param list:Adam
solver = "Adam"
#param bool
preview = False

def Run(self, graph=None):
	if self.mode=="Training":
		self.Train()
	elif self.mode=="Encoding":
		self.Encode()
	else:
		self.Decode()

def Train(self):
	self.X = tf.placeholder(tf.float32, shape=[None, self._input.input_size], name="x_input")		
		
	z = self.Encoder.Run(self.X)
	fakeX = self.Decoder.Run(z)
	
	AE_loss = tf.reduce_mean(tf.pow(fakeX-self.X, 2))
	AE_solver = tf.train.AdamOptimizer(self.learning_rate).minimize(AE_loss)
	
	# Initializing the variables
	init = tf.global_variables_initializer()
	
	# 'Saver' op to save and restore all the variables
	saver = tf.train.Saver()

	# Launch the graph
	with tf.Session() as sess:
		sess.run(init)
		
		if len(self.save_path)>0 and os.path.exists(self.save_path+"/model.meta"):
			# Restore model weights from previously saved model
			load_path=saver.restore(sess, self.save_path+"/model")
			print ("Model restored from file: %s" % self.save_path)  
			
		acc_log = []
			
		for it in range(self.training_iterations):
			batch = self._input.getNextBatch()
				
			X_batch  = batch[0]
			
			_, loss = sess.run([AE_solver, AE_loss], feed_dict={self.X: X_batch})
					
			if it % self.display_step == 0:
				SetState(self.id, it/self.training_iterations)
				SendChartData(self.id, "Loss", loss, "#ff0000")
			if it % self.display_step*10 == 0:
				test_X = [X_batch[0]]
				rebuilt_image = sess.run(fakeX, feed_dict = {self.X: test_X})[0]
				SendImageData(self.id, test_X[0], self._input.image_size[0], self._input.image_size[1], "original")
				SendImageData(self.id, rebuilt_image, self._input.image_size[0], self._input.image_size[1], "fake")

		if len(self.save_path)>0:
			# Save model weights to disk
			s_path = saver.save(sess, self.save_path+"/model")
			print ("Model saved in file: %s" % s_path)