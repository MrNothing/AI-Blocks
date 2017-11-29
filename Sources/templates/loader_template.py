#description Loader template
#type data source
#icon fa fa-sort-numeric-asc

#param int
input_size = 10
#param int
labels_size = 2
#param int
batch_size = 100

### You should intialize the datasets here...
self.X = [[0]*self.input_length]*1000
self.Y = [[0]*self.labels_size]*1000

self.testX = [[0]*self.input_length]*100
self.testY = [[0]*self.labels_size]*100

#This function is called by the trainer to fetch data
#It output two arrays: one for the inputs, and the other for the labels
#Example inputs: x=[[1, 0, 0], [0, 1, 0], ...]
#Example labels: y=[[1, 0], [0, 1], ...]
def getNextBatch(self):
	x = []
	y = []
	#TODO: fetch some data here...

	return x, y

#same rules as 'getNextBatch' except this is from the test dataset
def getTestBatch(self):
	x = []
	y = []
	#TODO: fetch some test data here...

	return x, y
