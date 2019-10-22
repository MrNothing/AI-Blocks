from keras.models import load_model

#description Keras Predictot script
#icon fa fa-magic
#MAIN=Run

#param object
_input = None
#param file
model_path = ""
#param bool
loop = False
#param bool 
manual_refresh = False
#param list:raw tensor,image,sound
_type = "raw tensor"
#param array|int
image_shape = [32, 32, 1]

def Run(self):
    
    _model = load_model(self.model_path)

    while(True):
        _x = self._input.GetTestBatch()

        x = None
        if self._type=="image":
            x = np.reshape(_x, [len(_x)] + self.image_shape)

        pred = _model.predict(x)[0]
        
        if self._type == "raw tensor":
            Log(pred)
        elif self._type == "image":
            #SendImageData(self.id, _x[0], self.image_shape[0], self.image_shape[1], "original")
            SendImageData(self.id, pred, self.image_shape[0], self.image_shape[1], "preview")
        elif self._type == "sound":
            #todo: send sound data...
            pass

        if not self.loop:
            break
        else:
            #wait for manual input:
            if self.manual_refresh:
                input("Press enter to run next frame")