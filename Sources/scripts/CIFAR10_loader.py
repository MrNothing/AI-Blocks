import random as rand
import numpy as np
import pickle
from random import randrange
#description Input loader from the CIFAR 10 dataset
#type data source
#icon fa fa-file-image-o

#param folder
path=""
#param int
batch_size = 100
#param list:Grayscale,RGB
image_format="Grayscale"
#param bool
one_pixel=False


self.fileID=0
self.format = self.image_format
self.IMG_SIZE = 1024
self.limiter = self.IMG_SIZE
self.LABELS_COUNT = 10
self.IMAGES_PER_FILE = 10000
self.FILES_AMOUNT = 5
self.data = []
self.testData = {}
self.input_size = self.IMG_SIZE
self.labels_size = self.LABELS_COUNT
self.image_size = [32, 32]

Log("Loading CIFAR 10 data...")
SetState(self.id, 0.01)
self.loadAllFiles(self.path+"/")

def loadAllFiles(self, path):
	Log("Loading files...")

	if self.FILES_AMOUNT<=1:
		self.loadFile(path+"train", False)
		self.loadFile(path+"test", True)
	else:
		for i in range(self.FILES_AMOUNT):
			file_name = path+"data_batch_"+str(i+1)
			self.loadFile(file_name)
			SetState(self.id, i/self.FILES_AMOUNT)

		file_name = path+"test_batch"
		self.loadFile(path+"test_batch", True)

def loadFile(self, file, isTest=False):
	fo = open(file, 'rb')
	u = pickle._Unpickler(fo)
	u.encoding = 'latin1'
	dict = u.load()
	fo.close()
	dict["training_state"] = 0

	Log("Loaded: "+file)

	if isTest==False:
		self.data.append(dict)
	else:
		self.testData = dict

def getNextBatch(self):
	amount = self.batch_size
	imagesData = []
	labels = []
	flipped = []

	for i in range(amount):
		fileID = 0
		imgID = 0
		
		if self.FILES_AMOUNT<=1:
			fileID = 1
		else:
			fileID = randrange(1, self.FILES_AMOUNT)
		
		imgID = randrange(0, self.IMAGES_PER_FILE-1)
		
		imgObj = self.loadOneImage(imgID, fileID)
		imagesData.append(imgObj["image"])
		labels.append(imgObj["label"])
		flipped.append(imgObj["flipped"])

	return [imagesData, labels, flipped]

def getTestBatch(self):
	amount = self.batch_size
	imagesData = []
	labels = []

	for i in range(amount):
		imgID = randrange(0, amount)
		
		imgObj = self.loadOneTestImage(imgID)
		imagesData.append(imgObj["image"])
		labels.append(imgObj["label"])

	return [imagesData, labels]

def getImageData(self, index, fileID=0):
	return self.data[fileID]["data"][index]

def loadOneTestImage(self, index):
	_image = []
	_label = None

	if self.one_pixel:
		if self.format=="Grayscale":
			 raise Exception("Grayscale for generation not implemented")
		
		for byte in range(self.IMG_SIZE*3-1):
				pixel = self.testData["data"][index][byte]
				_image.append(pixel/255)
				
		_label = [0]*256
		_label[self.testData["labels"][index]] = 1
	else:
		if self.format=="Grayscale":
			for byte in range(self.IMG_SIZE):
				pixel = (self.testData["data"][index][byte]+self.testData["data"][index][self.IMG_SIZE+byte]+self.testData["data"][index][self.IMG_SIZE*2+byte])/3
				_image.append(pixel/255)
		else:
			for byte in range(self.IMG_SIZE*3):
				pixel = self.testData["data"][index][byte]
				_image.append(pixel/255)
				
		_label = [0]*10
		_label[self.testData["labels"][index]] = 1
		
	return {"image":_image, "label":_label}

def loadOneImage(self, index, fileID=0):
	_image = []

	flipped=rand.choice([0, 2]);
	staturation = 0#rand.uniform(-10.0, 10.0)

	if self.format=="Grayscale":
		for byte in range(self.IMG_SIZE):
			if flipped:
				pixel = (self.data[fileID]["data"][index][self.IMG_SIZE-byte-1]+self.data[fileID]["data"][index][self.IMG_SIZE+byte]+self.data[fileID]["data"][index][self.IMG_SIZE*3-byte-1])/3
			else:
				pixel = (self.data[fileID]["data"][index][byte]+self.data[fileID]["data"][index][self.IMG_SIZE+byte]+self.data[fileID]["data"][index][self.IMG_SIZE*2+byte])/3
			_image.append(max(0, min(255, pixel+staturation))/255)
	else:
		for byte in range(self.IMG_SIZE*3):
			if flipped==1:
				pixel = (self.data[fileID]["data"][index][self.IMG_SIZE-byte-1])
			elif flipped==2:
				color_channel = int(byte/(32*32))*32*32
				local = byte-color_channel
				x = 32-local%32-1
				y = 32-int(local/32)
				pixel = (self.data[fileID]["data"][index][color_channel+local])
			else:
				pixel = self.data[fileID]["data"][index][byte]
			_image.append((pixel+staturation)/255)

	_label = [0]*10
	_label[self.data[fileID]["labels"][index]] = 1
	
	return {"image":_image, "label":_label, "flipped": flipped}

def getImageBytes(self):
	if self.format=="Grayscale":
		return self.IMG_SIZE
	else:
		return self.IMG_SIZE*3
	
def getImageWidth(self):
	if self.format=="Grayscale":
		return int(np.sqrt(self.IMG_SIZE))
	else:
		return int(np.sqrt(self.IMG_SIZE*3))

def getImagesCount(self):
	return self.IMAGES_PER_FILE*self.FILES_AMOUNT

def getTrainedCount(self):
	count = 0
	for i in range(self.FILES_AMOUNT):
		count+= self.data[i]["training_state"]
	return count
	
def rangeFactor(t, point, _range):
	ratio = np.abs (point - t) / _range;
	if ratio < 1:
		return 1 - ratio;
	else:
		return 0;