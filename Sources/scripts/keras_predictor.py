
#param object
_input = None
#param object
model = None
#param bool
loop = False
#param bool 
manual_refresh = False
#param list:raw tensor,image,sound
_type = "raw tensor"
#param array|int
image_shape = [32, 32, 3]

def Run(self):
    while(True):
        x = self._input.GetNextBatch()
        pred = self.model.instance.predict(x)
        
        if self._type == "raw tensor":
            Log(pred[0])
        elif self._type == "image":
            SendImageData(self.id, pred, self.image_shape[0], self.image_shape[1], "preview")
        elif self._type == "sound"
            #todo: send sound data...
            pass

        if not self.loop:
            break
        else:
            #wait for manual input:
            if self.manual_refresh:
            t = input("Press enter to run next frame")