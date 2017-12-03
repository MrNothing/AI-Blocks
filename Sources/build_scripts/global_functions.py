import sys
from PIL import Image
import tempfile
import numpy as np
import os
import matplotlib.pyplot as plt
import pickle
import soundfile as sf

#Built with AIBlocks
#https://github.com/MrNothing/AI-Blocks

NaN = None

def Log(msg, flush=True, ignore_errors=False):
	if ignore_errors:
		print (msg.encode(sys.stdout.encoding, errors='replace'))
	else:
		print (msg)

	if EDITOR_MODE:
		sys.stderr.flush()
		sys.stdout.flush()


def LogErr(msg, flush=False):
	Log('err:'+msg, flush)

def SetState(id, state, flush=True):
	if EDITOR_MODE:
		Log('status:'+str(id)+':'+str(state), flush)

def SendChartData(id, name, value, color='#3e95cd', flush=True):
	if EDITOR_MODE:
		Log("chart:"+str(id)+":"+str(name)+":"+str(value)+":"+str(color), flush)

def SendPieData(id, name, color='#3e95cd', flush=True):
	if EDITOR_MODE:
		Log("pie:"+str(id)+":"+str(name)+":"+str(color), flush)

#data contains an array or normalized inputs (from 0 to 1)
def SendImageData(id, data, width=32, height=32, name="", rgba=False, flush=True, invert=False, offset=0):
	if EDITOR_MODE:
		img = Image.new( 'RGBA', (width,height), "white")
		pixels = img.load()

		for i in range(len(data)):	# for every pixel:
			y = int(np.floor(i/width))
			x = i-y*width
			#print("coord: "+str(x)+"_"+str(y)+":"+str(data[i]))
			if rgba:
				pixel = max(0, data[i])
			else:
				pixel = [max(0, data[i]), max(0, data[i]), max(0, data[i]), 1]
			if invert:
				pixels[x,height-y-1] = (int(pixel[0]*255), int(pixel[1]*255), int(pixel[2]*255), 255) # set the colour accordingly
			else:
				pixels[x,y] = (int(pixel[0]*255), int(pixel[1]*255), int(pixel[2]*255), 255) # set the colour accordingly


		tmpDir = tempfile.gettempdir()
		imgPath = str(tmpDir)+"/"+name+"_out_"+str(id)+"_"+str(offset)+".png"
		img.save(imgPath)
		
		Log("img_data,"+str(id)+","+imgPath+","+name, flush)

def SendAudioData(id, data, name, samplerate=4410, offset=0):
	tmpDir = tempfile.gettempdir()
	imgPath = str(tmpDir)+"/"+name+"_out_"+str(id)+"_"+str(offset)+".wav"
		
	sf.write(imgPath, data, samplerate)
	Log("audio_data,"+str(id)+","+imgPath+","+name, True)

def SendGraph(id, data, data2=None, name="", offset=0, flush=True):
	plt.plot(data)

	if data2!=None:
		plt.plot(data2)

	plt.title(name)

	tmpDir = tempfile.gettempdir()
	imgPath = str(tmpDir)+"/"+name+"_out_"+str(id)+"_"+str(offset)+".png"
	plt.savefig(imgPath, bbox_inches='tight')
	plt.close()
	Log("img_data,"+str(id)+","+imgPath+","+name, flush)

class IOHelpers:
	def save_output(data, cache_file):
		with open(cache_file, 'wb') as f:
			pickle.dump(data, f, pickle.HIGHEST_PROTOCOL)
			Log("data saved in file: "+cache_file)
		
	def load_output(cache_file):		
		if os.path.exists(cache_file):
			with open(cache_file, 'rb') as f:
				data = pickle.load(f)
				Log("data loaded from file: "+cache_file)
				return data
		else:
			LogErr("file was not found: "+cache_file)
			return None

	def SaveAudioFile(id, data, name, samplerate=4410, offset=0):
		tmpDir = tempfile.gettempdir()
		imgPath = str(tmpDir)+"/"+name+"_out_"+str(id)+"_"+str(offset)+".wav"
			
		sf.write(imgPath, data, samplerate)

	

class TFInstance:
	def __init__(self, session, saver, save_path):
		self.session = session
		self.saver = saver
		self.save_path = save_path

	def Run(self, tensors, feed_dict):
		return self.session.run(tensors, feed_dict=feed_dict)

class AIBlocks:
	def InitModel(load_path=""):
		# Initializing the variables
		init = tf.global_variables_initializer()

		# 'Saver' op to save and restore all the variables
		saver = tf.train.Saver()

		sess = tf.Session()
		sess.run(init)

		if len(load_path)>0 and os.path.exists(load_path+"/model.meta"):
			res=saver.restore(sess, load_path+"/model")
			Log ("Model loaded from: "+load_path+"/model")

		return TFInstance(sess, saver, load_path)

	def SaveModel(instance, save_path=""):
		if len(instance.save_path)>0:
			save_path = instance.save_path

		if len(save_path)>0:
			# Save model weights to disk
			s_path = instance.saver.save(instance.session, save_path+"/model")
			Log ("Model saved in file: "+str(s_path))

	def CloseSession(instance):
		instance.session.close()

	def CloseInstance(instance):
		instance.session.close()

	def MaxIndex(data):
		_max = -10000000
		best_index = 0
		for i in range(len(data)):
			if(_max<data[i]):
				_max = data[i]
				best_index = i
		return best_index

class TextHelper:
	def __init__(self):
		self.alphabet = {'':0, 'b':1, 'c':2, 'd':3, 'e':4, 'f':5, 'g':6, 'h':7, 'i':8, 'j':9, 'k':10, 'l':11, 'm':12, 'n':13, 'o':14, 'p':15, 'q':16, 'r':17, 's':18, 't':19, 'u':20, 'v':21, 'w':22, 'x':23, 'y':24, 'z':25, 'a':26, ' ':27}
		self.inv_alphabet = ['', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'a', ' ']

	def char2float(self, c):
		return ord(c)/256

	def float2Char(self, value):
		val = int(value*256)
		if(val!=0):
			return chr(val)
		elif val>256:
			return '?'
		else:
			return ''

	def word2vec(self, word, charactersPerWord=10):
		word = word.lower()
		res = []
		for i in range(len(word)):
			res+=self.char2OneHot(word[i])

		while len(res)<charactersPerWord*len(self.alphabet):
			res.append(0)

		return res[0:charactersPerWord*len(self.alphabet)]

	def vec2Word(self, vec):
		res = ''
		for i in range(int(len(vec)/len(self.alphabet))):
			res+=self.oneHot2char(vec[i*len(self.alphabet):(i+1)*len(self.alphabet)])
		return res

	def oneHot2char(self, vec):
		index = AIBlocks.MaxIndex(vec)
		if(index>len(self.alphabet)-1):
			return '?'
		else:
			return self.inv_alphabet[index]

	def char2OneHot(self, value):
		val = 0
		res = [0]*len(self.alphabet)
		if self.alphabet.__contains__(value):
			val = self.alphabet[value]
		res[val] = 1
		return res

	def float2Word(self, value):
		val = int(value*self.wordsCounter)
		if(val<0):
			return "<?"
		elif(val>self.wordsCounter-1):
			return ">?"
		else:
			return self.InvertedWordsIndex[val]

class Math:
	def Lerp(a, b, t):
		return (a+(b-a)*t)

	def LerpVec(a, b, t):
		for i in range(len(a)):
			a[i] = Math.Lerp(a[i], b[i], t)

	def Magnitude(a):
		s = 0
		for i in range(len(a)):
			s += abs(a[i])
		return s

	def MaxIndex(data):
		_max = -10000000
		best_index = 0
		for i in range(len(data)):
			if(_max<data[i]):
				_max = data[i]
				best_index = i
		return best_index