import random as rand
import time

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
#param folder
save_path = ""
#param list: Image,Sound,Text,3D Model,Raw
preview = "Image"
#editor param float
#preview_state = 0.5

def Run(self):
	self.X = tf.placeholder(tf.float32, shape=[None, self._input.input_size], name="x_input")	
	self.Z = tf.placeholder(tf.float32, shape=[None, self.latent_size], name="z_input")		

	fakeX = self.Generator.Run(self.Z)
	
	#initialize everything
	instance = AIBlocks.InitModel(load_path=self.save_path)
	Log("Model initialized!")
			
	acc_log = []

	resetRand = 0
	test_Z = np.random.uniform(-1., 1., size=[self.latent_size])
	test_Z1 = np.random.uniform(-1., 1., size=[self.latent_size])
	test_Z2 = np.random.uniform(-1., 1., size=[self.latent_size])
	targetRand = np.random.uniform(-1., 1., size=[self.latent_size])
	targetRand1 = np.random.uniform(-1., 1., size=[self.latent_size])
	targetRand2 = np.random.uniform(-1., 1., size=[self.latent_size])
	
	while 1:
		Math.LerpVec(test_Z, targetRand, 0.1)
		Math.LerpVec(test_Z1, targetRand1, 0.1)
		Math.LerpVec(test_Z2, targetRand2, 0.1)

		if(resetRand>10):
			targetRand = np.random.uniform(-1., 1., size=[self.latent_size])
			targetRand1 = np.random.uniform(-1., 1., size=[self.latent_size])
			targetRand2 = np.random.uniform(-1., 1., size=[self.latent_size])
			resetRand = 0

		resetRand += 1
		
		imagined = instance.Run(fakeX, feed_dict = {self.Z: [test_Z]})[0]
		imagined1 = instance.Run(fakeX, feed_dict = {self.Z: [test_Z1]})[0]
		imagined2 = instance.Run(fakeX, feed_dict = {self.Z: [test_Z2]})[0]

		if self.preview=="Image":
			SendImageData(self.id, imagined, self._input.image_size[0], self._input.image_size[1], "1")
			SendImageData(self.id, imagined1, self._input.image_size[0], self._input.image_size[1], "2")
			SendImageData(self.id, imagined2, self._input.image_size[0], self._input.image_size[1], "3")
		elif self.preview=="Sound":
			pass
		else:
			pass

		time.sleep(0.01)

	AIBlocks.SaveModel(instance)
	AIBlocks.CloseInstance(instance)