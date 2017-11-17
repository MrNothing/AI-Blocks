#description CSV data loader
#type data source
#icon fa fa-file-excel-o

#param file
file_path = ""
#param string
separator=';'
#param int
startLine = 1
#param array|int
data_columns = [0]
#param array|int
labels_columns = [1, 2]

self.input_size = len(data_columns)
self.labels_size = len(labels_columns)

text_file = open(fileName, "r")
data = text_file.read()

lines = data.split('\n')

self.X = []
self.Y = []

i = 0
while i<len(lines):
	line = lines[i]
	columns = line.split(separator)
	
	_input = []
	label = []

	for _x in self.data_columns:
		_input.append(float(columns[_x]))
	for _y in self.labels_columns:
		label.append(float(columns[_y]))
	
	self.X.append(_input)
	self.Y.append(label)

	i+=1

def getNextBatch(self):
	x = []
	y = []
	for i in range(self.batch_size):
		index = self.getRandomIndex()
		x.append(self.X[index])
		y.append(self.Y[index])

	return [x, y]

def getTestBatch(self):
	return self.getNextBatch()

def getRandomIndex(self):
	rand_start = rand.uniform(0, 1)
	return min(int(len(self.X)*rand_start), len(self.X)-1)