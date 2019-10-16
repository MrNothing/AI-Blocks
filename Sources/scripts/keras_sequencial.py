import keras
import json
import math

from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation, Flatten
from keras.layers import Conv2D, MaxPooling2D

#param array|eval
input_shape = [32, 32, 1]
#param array|string
model = []
#param float
learning_rate = 0.0001
#param float 
decay = 1e-6
#param list:mean_squared_error,mean_absolute_error,mean_absolute_percentage_error,mean_squared_logarithmic_error,squared_hinge,hinge,categorical_hinge,logcosh,huber_loss,categorical_crossentropy,sparse_categorical_crossentropy,binary_crossentropy,kullback_leibler_divergence,poisson,cosine_proximity
loss = "mean_squared_error"
#param array|string
metrics = ["accuracy"]

def Run(self):
    model = Sequential()
    for i in range(len(self.model)):
        layer = None

        if i==0:
            layer = self.ParseInput(self.model[i], True)
        else:
            layer = self.ParseInput(self.model[i])
        Log("layer_"+str(i)+": "+str(layer))
        model.add(layer)

    # initiate RMSprop optimizer
    opt = keras.optimizers.RMSprop(learning_rate=self.learning_rate, decay=self.decay)

    # Let's train the model using RMSprop
    model.compile(loss=self.loss,
                optimizer=opt,
                metrics=self.metrics)

    self.instance = model

def ParseInput(self, val, has_input=False):
    args = val.split(":")
    typ = args[0]

    if typ=="Activation":
        return Activation(args[1])
    elif typ=="Dropout":
        return Dropout(float(args[1]))
    elif typ=="Flatten":
        return Flatten()
    elif typ=="MaxPooling2D":
        return MaxPooling2D(pool_size=(int(args[1]), int(args[2])))
    elif typ=="MaxPooling1D":
        return MaxPooling1D(pool_size=(int(args[1])))

    if has_input:
        if typ=="Dense":
            return Dense(int(args[1]), input_dim=self.input_shape[0])
        elif typ=="Conv2D":
            return Conv2D(int(args[1]), (int(args[2]), int(args[3])), padding='same', input_shape=(self.input_shape[0], self.input_shape[1], self.input_shape[2]))
        elif typ=="Conv1D":
            return Conv1D(int(args[1]), int(args[2]), input_shape=(self.input_shape[0],self.input_shape[1]))
    else:
        if typ=="Dense":
            return Dense(int(args[1]))
        elif typ=="Conv2D":
            return Conv2D(int(args[1]), (int(args[2]), int(args[3])), padding='same')
        elif typ=="Conv1D":
            return Conv1D(int(args[1]), int(args[2]))
        
        
