import numpy as np

#description Keras Classifier script
#icon fa fa-magic
#MAIN=Run

#param object
_input = None
#param object
model = None
#param int
epochs = 1000
#param int
display_step = 5
#param list:raw tensor,image,sound
_type = "raw tensor"

def Run(self):
    self.model.Run()

    for it in range(self.epochs):
        batch = self._input.getNextBatch()

        X_batch  = np.asarray(batch[0])
        Y_batch  = np.asarray(batch[1])

        loss = self.model.instance.train_on_batch(X_batch, Y_batch)

		#every N steps, send the state to the scene
        if it % self.display_step == 0:
            SetState(self.id, it/self.training_iterations)
            SendChartData(self.id, "Loss", loss, "#ff0000")

            if self._type=="image":
                test_X = [X_batch[0]]
                test_Y = [Y_batch[0]]
                rebuilt_image = self.model.instance.predict(test_X)[0]
                SendImageData(self.id, test_X[0][0:1024], self._input.image_width, self._input.image_width, "original")
                SendImageData(self.id, test_Y[0], self._input.image_width, self._input.image_width, "depth")
                SendImageData(self.id, rebuilt_image, self._input.image_width, self._input.image_width, "fake")
        
