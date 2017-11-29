import random as rand

#description Generative Adverserial Networks trainer
#icon fa fa-retweet
#MAIN=Run

#param object
_input = None
#param object
Generator = None
#param object
Discriminator = None
#param int
latent_size = 10

#param float
learning_rate = 0.0001
#param int
training_iterations = 3000	
#param int
display_step = 100
#param folder
save_path = ""
#param list:None,Image,Sound,Text,3D Model
preview = "None"
#param int
preview_state = 0

def Run(self):
	self.X = tf.placeholder(tf.float32, shape=[None, self._input.input_size], name="x_input")	
	self.Z = tf.placeholder(tf.float32, shape=[None, self.latent_size], name="z_input")		

	fakeX = self.Generator.Run(self.Z)
	
	D_real = self.Discriminator.Run(self.X)
	D_fake = self.Discriminator.Run(fakeX)


	D_loss_real = tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(logits=D_real, labels=tf.ones_like(D_real)))
	D_loss_fake = tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(logits=D_fake, labels=tf.zeros_like(D_fake)))
	D_loss = D_loss_real + D_loss_fake
	G_loss = tf.reduce_mean(tf.nn.sigmoid_cross_entropy_with_logits(logits=D_fake, labels=tf.ones_like(D_fake)))

	D_solver = tf.train.AdamOptimizer(self.learning_rate).minimize(D_loss, var_list=self.Discriminator.getVariables())
	G_solver = tf.train.AdamOptimizer(self.learning_rate).minimize(G_loss, var_list=self.Generator.getVariables())
	
	#initialize everything
	instance = AIBlocks.InitModel(load_path=self.save_path)
	Log("Model initialized!")
			
	acc_logd = []
	acc_logg = []
	
	resetRand = 0
	test_Z = np.random.uniform(-1., 1., size=[self.latent_size])
	targetRand = np.random.uniform(-1., 1., size=[self.latent_size])

	for it in range(self.training_iterations):
		batch = self._input.getNextBatch()
			
		X_batch  = batch[0]
		Z_batch = np.random.rand(self._input.batch_size, self.latent_size)

		_, _, d_loss, g_loss = instance.Run([D_solver, G_solver, D_loss, G_loss], feed_dict={self.X: X_batch, self.Z: Z_batch})
			
		acc_logd.append(d_loss)
		acc_logg.append(g_loss)

		if it % self.display_step == 0:
			SetState(self.id, it/self.training_iterations)
			SendChartData(self.id, "D Loss", d_loss, "#ff0000")
			SendChartData(self.id, "G Loss", g_loss, "#00ff00")
			#SendGraph(self.id, acc_logd[-1000:], data2=acc_logg[-1000:], name="Loss")

		if self.preview!="None":
			Math.LerpVec(test_Z, targetRand, 0.1)
			imagined = instance.Run(fakeX, feed_dict = {self.Z: [test_Z]})[0]

			if(resetRand>10):
				targetRand = np.random.uniform(-1., 1., size=[self.latent_size])
				resetRand = 0

			resetRand += 1

			if self.preview=="Image":
				SendImageData(self.id, imagined, self._input.image_size[0], self._input.image_size[1], "1")
			elif self.preview=="Sound":
				pass
			else:
				pass

	AIBlocks.SaveModel(instance)
	AIBlocks.CloseInstance(instance)