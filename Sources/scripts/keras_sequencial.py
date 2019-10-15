import keras
import json

from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation, Flatten
from keras.layers import Conv2D, MaxPooling2D

#param info
infos = "Dense, Activation, Dropout, Flatten, MaxPooling2D, Conv2D"
#param array|string
model = []
#param float
learning_rate = 0.0001
#param float 
decay = 1e-6
#param list:categorical_crossentropy
loss = "categorical_crossentropy"
#param array|string
metrics = ["accuracy"]

def Run(self):
    model = Sequential()
    for i in range(len(self.model)):
        model.add(self.ParseInput(self.model(i)))

    # initiate RMSprop optimizer
    opt = keras.optimizers.RMSprop(learning_rate=self.learning_rate, decay=self.decay)

    # Let's train the model using RMSprop
    model.compile(loss=self.loss,
                optimizer=opt,
                metrics=self.metrics)

    self.instance = model

def ParseInput(self, val):
    args = val.split(":")
    typ = args[0]

    if typ=="Dense":
        return Dense(int(args[1]))
    elif typ=="Activation":
        return Activation(args[1])
    elif typ=="Dropout":
        return Dropout(int(args[1]))
    elif typ=="Flatten":
        return Flatten()
    elif typ=="MaxPooling2D":
        return MaxPooling2D(pool_size=(int(args[1]), (args[2])))
    elif typ=="Conv2D":
        Conv2D(int(args[1]), (int(args[2]), int(args[3])), padding='same')
        
