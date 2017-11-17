import time
import tensorflow as tf
import os

#description Train your model on classifing things!
#icon fa fa-magic
#MAIN=Run

#param object
_input = None
#param object
_model = None
#param folder
save_path = ""
#param bool
testing = True

def Run(self):

	#defining the model...
	self.X = tf.placeholder(tf.float32, shape=[None, self._input.input_size], name="x_input")    
	_y = self._model.Run(self.X)

	Log("Model initialized!")

	# Initializing the variables
	init = tf.global_variables_initializer()

	# 'Saver' op to save and restore all the variables
	saver = tf.train.Saver()

	save_path = self.save_path

	SetState(self.id, 0.001)
	
	if self.testing:	
	 	# Launch the graph
		with tf.Session() as sess:
			self.sess = sess
			sess.run(init)
	        
			if len(save_path)>0 and os.path.exists(save_path+"/model.meta"):
				# Restore model weights from previously saved model
				#saver = tf.train.import_meta_graph(save_path+'/model.meta')
				load_path=saver.restore(sess, save_path+"/model")
				Log ("Model restored from file: " + str(save_path+"/model"))  
				#TODO: restore acc_log and loss_log

			batch = self._input.getTestBatch()
			X_batch = batch[0]
			Y_batch = batch[1]

			prediction = sess.run(_y, feed_dict={self.X: X_batch})

			found=0
			failed=0
			for i in range(len(prediction)):
				assert1 = self.max_index(Y_batch[i])
				assert2 = self.max_index(prediction[i])

				tmp = "Found"
				color = "#00ff00"
				if assert1!=assert2:
					tmp = "Failed"
					color = "#ff0000"
					failed+=1
				else:
					found+=1

				SendPieData(self.id, tmp, color);		
				SetState(self.id, i/len(prediction))
				time.sleep(0.1)

			Log("Accuracy: "+str(found/(failed+found)*100)+"%")

			SetState(self.id, 1)
	else:
		self.sess = tf.Session()
		self.sess.run(init)
	        
		if len(save_path)>0 and os.path.exists(save_path+"/model.meta"):
			# Restore model weights from previously saved model
			#saver = tf.train.import_meta_graph(save_path+'/model.meta')
			load_path=saver.restore(sess, save_path+"/model")
			Log ("Model restored from file: " + str(save_path+"/model"))  
			#TODO: restore acc_log and loss_log

		self.ready = True
		SetState(self.id, 0.999)

		while True:
			time.sleep(1)

def predict(self, input):
	return sess.run(_y, feed_dict={self.X: input})

def max_index(self, data):
	_max = -10000000
	best_index = 0
	for i in range(len(data)):
		if(_max<data[i]):
			_max = data[i]
			best_index = i
	return best_index