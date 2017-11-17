import random as rand
from tensorflow.examples.tutorials.mnist import input_data as minst_input_data
#description Input loader from the MNIST dataset
#type data source
#icon fa fa-sort-numeric-asc

#param int
batch_size = 100
self.path = ""

self.input_size = 784
self.labels_size = 10
self.image_size = [28, 28]

Log("Loading minst data...")
SetState(self.id, 0.25)
self.mnist = minst_input_data.read_data_sets(self.path, one_hot=True)
SendImageData(self.id, self.mnist.test.images[rand.randint(0, len(self.mnist.test.images))], self.image_size[0], self.image_size[1])
SetState(self.id, 1)

def getNextBatch(self):
    batch_x, batch_y = self.mnist.train.next_batch(self.batch_size)
    return [batch_x, batch_y]

def getTestBatch(self):
    return [self.mnist.test.images[:self.batch_size], self.mnist.test.labels[:self.batch_size]]
