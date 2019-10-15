#param object
model = None
#param int
epochs = 10
#param int
batch_size = 100
#param int
display_step = 5

def Run(self):
    for it in range(self.epochs):
        batch = self._input.getNextBatch()

        X_batch  = batch[0]
        Y_batch  = batch[1]

        loss = self.model.instance.train_on_batch(X_batch, Y_batch)

		#every N steps, send the state to the scene
        if it % self.display_step == 0:
            SetState(self.id, it/self.training_iterations)
            SendChartData(self.id, "Loss", loss, "#ff0000")
