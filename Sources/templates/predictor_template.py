import time
import tensorflow as tf
import os

#description Predictor script template
#icon fa fa-magic
#MAIN=Run

#param object
_input = None
#param object
_model = None
#param folder
load_path = ""

def Run(self):

	### defining the model ###

	#input
	input = tf.placeholder(tf.float32, shape=[None, self._input.input_size], name="x_input")    
	
	#output
	output = self._model.Run(input)

	#initialize everything
 	instance = AIBlocks.InitModel(load_path=self.load_path)
	Log("Model initialized!")

	#load test data
	batch = self._input.getTestBatch()
	inputs = batch[0]
	real_categories = batch[1]
	
	predictions = instance.Run(output, feed_dict={input: inputs})

	for i in range(len(predictions)):
		estimation = AIBlocks.MaxIndex(predictions[i])
		real = AIBlocks.MaxIndex(Y_batch[i])
		
		if(estimation==real):
			#TODO: Do something here...

	AIBlocks.CloseInstance(instance)