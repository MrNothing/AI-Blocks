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
def SendImageData(id, data, width=32, height=32, name="", rgba=False, flush=True, invert=False, offset=0, resize=[]):
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

		if len(resize)>0:
			img = img.resize((resize[0], resize[1]), Image.NEAREST)

		tmpDir = tempfile.gettempdir()
		imgPath = str(tmpDir)+"/"+name+"_out_"+str(id)+"_"+str(offset)+".png"
		img.save(imgPath)
		
		Log("img_data,"+str(id)+","+imgPath+","+name, flush)

def SendAudioData(id, data, name, samplerate=4410, offset=0):
	if EDITOR_MODE:
		tmpDir = tempfile.gettempdir()
		imgPath = str(tmpDir)+"/"+name+"_out_"+str(id)+"_"+str(offset)+".wav"
			
		sf.write(imgPath, data, samplerate)
		Log("audio_data,"+str(id)+","+imgPath+","+name, True)

def SendGraph(id, data, data2=None, name="", offset=0, flush=True):
	if EDITOR_MODE:
		plt.plot(data)

		if data2!=None:
			plt.plot(data2)

		plt.title(name)

		tmpDir = tempfile.gettempdir()
		imgPath = str(tmpDir)+"/"+name+"_out_"+str(id)+"_"+str(offset)+".png"
		plt.savefig(imgPath, bbox_inches='tight')
		plt.close()
		Log("img_data,"+str(id)+","+imgPath+","+name, flush)

SendFastGraphWarningSent = False
def SendFastGraph(id, data, name="", offset=0, flush=True):
	global SendFastGraphWarningSent

	if EDITOR_MODE:
		width = len(data)

		if width>=1000 and not SendFastGraphWarningSent:
			LogErr("Warning: feeding a large array to SendFastGraph can take time to render.", True)
			SendFastGraphWarningSent = True

		height = int(len(data)/2)

		_max = Math.MaxValue(data)
		_min = Math.MinValue(data)

		#Log("_max: "+str(_max))

		img = Image.new( 'RGBA', (width,height), "white")
		pixels = img.load()

		for x in range(width):
			val = data[x]-_min

			y = max(0, int(height*(val/abs(_max-_min))))
			y = min(height-1, y)

			pixels[x, int(height/2)] = (128, 0, 0, 255) # set the colour accordingly

			state = int(height/2)

			while state!=y:
				if abs(state-y)>1:
					pixels[x,state] = (128, 128, 255, 255) # set the colour accordingly
				else:
					pixels[x,state] = (0, 0, 255, 255) # set the colour accordingly

				if state<y:
					state+=1
				else:
					state-=1

		IOHelpers.CarveNumber(pixels, _max, 10, 0)
		IOHelpers.CarveNumber(pixels, _min, 10, height-7)

		tmpDir = tempfile.gettempdir()
		imgPath = str(tmpDir)+"/"+name+"_out_"+str(id)+"_"+str(offset)+".png"
		img.save(imgPath)
		
		Log("img_data,"+str(id)+","+imgPath+","+name, flush)

def SendSpectrogram(id, times, frequencies, spectogram, name="", offset=0, flush=True):
	if EDITOR_MODE:
		plt.pcolormesh(times, frequencies, spectogram)
		plt.ylabel('Frequency [Hz]')
		plt.xlabel('Time [sec]')

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

	def SaveAudioFile(data, path, samplerate=4410, offset=0):
		sf.write(path, data, samplerate)

	def CarveNumber(pixels, number, x, y, bg = (255, 255, 255, 255), color=(0, 0, 0, 255)):
		str_num = str(number)
		loc_x = 0
		for i in range(len(str_num)):
			IOHelpers.CarveDigit(pixels, str_num[i], x+loc_x, y, bg, color)
			loc_x+=4

	def CreateImage(data, width=32, height=32, rgba=False, invert=False, resize=[]):
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

		if len(resize)>0:
			img = img.resize((resize[0], resize[1]), Image.NEAREST)

		return img
	
	def CarveDigit(pixels, digit, x, y, bg = (255, 255, 255, 255), color=(0, 0, 0, 255)):
		#3x5 = 15pixels
		if digit=='0':
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = color
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = color
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = color

			pixels[x+0, y+2] = color
			pixels[x+1, y+2] = bg
			pixels[x+2, y+2] = color

			pixels[x+0, y+3] = color
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = color

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = bg
		elif digit == '1':
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = bg
			pixels[x+2, y+0] = color

			pixels[x+0, y+1] = bg
			pixels[x+1, y+1] = color
			pixels[x+2, y+1] = color

			pixels[x+0, y+2] = bg
			pixels[x+1, y+2] = bg
			pixels[x+2, y+2] = color

			pixels[x+0, y+3] = bg
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = color

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = bg
			pixels[x+2, y+4] = color
		elif digit == '2':
			pixels[x+0, y+0] = color
			pixels[x+1, y+0] = color
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = bg
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = color

			pixels[x+0, y+2] = bg
			pixels[x+1, y+2] = color
			pixels[x+2, y+2] = bg

			pixels[x+0, y+3] = color
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = bg

			pixels[x+0, y+4] = color
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = color
		elif digit == '3':
			pixels[x+0, y+0] = color
			pixels[x+1, y+0] = color
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = bg
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = color

			pixels[x+0, y+2] = bg
			pixels[x+1, y+2] = color
			pixels[x+2, y+2] = bg

			pixels[x+0, y+3] = bg
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = color

			pixels[x+0, y+4] = color
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = bg
		elif digit == '4':
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = bg
			pixels[x+2, y+0] = color

			pixels[x+0, y+1] = bg
			pixels[x+1, y+1] = color
			pixels[x+2, y+1] = color

			pixels[x+0, y+2] = color
			pixels[x+1, y+2] = bg
			pixels[x+2, y+2] = color

			pixels[x+0, y+3] = color
			pixels[x+1, y+3] = color
			pixels[x+2, y+3] = color

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = bg
			pixels[x+2, y+4] = color
		elif digit == '5':
			pixels[x+0, y+0] = color
			pixels[x+1, y+0] = color
			pixels[x+2, y+0] = color

			pixels[x+0, y+1] = color
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = bg

			pixels[x+0, y+2] = color
			pixels[x+1, y+2] = color
			pixels[x+2, y+2] = color

			pixels[x+0, y+3] = bg
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = color

			pixels[x+0, y+4] = color
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = bg
		elif digit == '6':
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = color
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = color
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = bg

			pixels[x+0, y+2] = color
			pixels[x+1, y+2] = color
			pixels[x+2, y+2] = bg

			pixels[x+0, y+3] = color
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = color

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = bg
		elif digit == '7':
			pixels[x+0, y+0] = color
			pixels[x+1, y+0] = color
			pixels[x+2, y+0] = color

			pixels[x+0, y+1] = bg
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = color

			pixels[x+0, y+2] = bg
			pixels[x+1, y+2] = color
			pixels[x+2, y+2] = bg

			pixels[x+0, y+3] = bg
			pixels[x+1, y+3] = color
			pixels[x+2, y+3] = bg

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = bg
		elif digit == '8':
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = color
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = color
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = color

			pixels[x+0, y+2] = bg
			pixels[x+1, y+2] = color
			pixels[x+2, y+2] = bg

			pixels[x+0, y+3] = color
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = color

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = bg
		elif digit == '9':
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = color
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = color
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = color

			pixels[x+0, y+2] = color
			pixels[x+1, y+2] = color
			pixels[x+2, y+2] = color

			pixels[x+0, y+3] = bg
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = color

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = bg
		elif digit=='-':
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = bg
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = bg
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = bg

			pixels[x+0, y+2] = color
			pixels[x+1, y+2] = color
			pixels[x+2, y+2] = color

			pixels[x+0, y+3] = bg
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = bg

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = bg
			pixels[x+2, y+4] = bg
		elif digit=='.':
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = bg
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = bg
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = bg

			pixels[x+0, y+2] = bg
			pixels[x+1, y+2] = bg
			pixels[x+2, y+2] = bg

			pixels[x+0, y+3] = bg
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = bg

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = bg
		elif digit=='e':
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = color
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = color
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = color

			pixels[x+0, y+2] = color
			pixels[x+1, y+2] = color
			pixels[x+2, y+2] = color

			pixels[x+0, y+3] = color
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = bg

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = color
			pixels[x+2, y+4] = color
		else:
			pixels[x+0, y+0] = bg
			pixels[x+1, y+0] = bg
			pixels[x+2, y+0] = bg

			pixels[x+0, y+1] = bg
			pixels[x+1, y+1] = bg
			pixels[x+2, y+1] = bg

			pixels[x+0, y+2] = bg
			pixels[x+1, y+2] = bg
			pixels[x+2, y+2] = bg

			pixels[x+0, y+3] = bg
			pixels[x+1, y+3] = bg
			pixels[x+2, y+3] = bg

			pixels[x+0, y+4] = bg
			pixels[x+1, y+4] = bg
			pixels[x+2, y+4] = bg
		return pixels

	

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

	def MaxValue(data):
		_max = -10000000
		best_index = 0
		for i in range(len(data)):
			if(_max<data[i]):
				_max = data[i]
				best_index = i
		return data[best_index]

	def MinValue(data):
		_max = 10000000
		best_index = 0
		for i in range(len(data)):
			if(_max>data[i]):
				_max = data[i]
				best_index = i
		return data[best_index]

	def OneHot(data, labels=32, offset=0, strict=False):
		output = []
		isMulti = False
		if str(labels.__class__())=="[]":
			labels = labels[0]
			isMulti = True
		
		if isMulti:
			for d in data:
				row = [0]*labels
				index = int(d*labels)
				
				if index<0:
					if strict:
						raise Exception("Value: "+str(d)+" was out of bounds while encoding OneHot")
					else:
						index = 0
				elif index>labels-1:
					if strict:
						raise Exception("Value: "+str(d)+" was out of bounds while encoding OneHot")
					else:
						index = labels-1
					
				row[index] = 1

				output.append(row)
		else:
			output = [0]*labels

			index = int(data*labels)

			if index<0:
				if strict:
					raise Exception("index: "+str(index)+" was out of bounds while encoding OneHot")
				else:
					index = 0
			elif index>labels-1:
				if strict:
					raise Exception("index: "+str(index)+" was out of bounds while encoding OneHot")
				else:
					index = labels-1

			output[index] = 1
				 
		return output

		
	def uLaw(x, mu=8):
		if str(x.__class__())=="[]":
			res = []
			for i in range(len(x)):
				res.append(Math.uLaw(x[i], mu))

			return res
		else:
			return np.sign(x)*np.log(1+mu*abs(x))/np.log(1+mu)
		
	def uLawInvert(x, mu=8):
		a = mu
		k = 1/np.log(1+a)
		u = abs(x)
		return np.sign(x)*(np.exp(u/k)-1)/a
		
	#uLaw, default 8bit (256)
	def uLawEncode(data, u=1024, real_uLaw=False, quantification=True):
		
		if quantification:
			data = np.floor(data/(1/u))*(1/u)
		
		if real_uLaw:
			data = (Encoder.uLaw(data*2-1)+1)/2
		
		return data
		
	def uLawDecode(data):
		return (Encoder.uLawInvert((data-0.5)*2)+1)/2

	def quantify(data, u=256):
		return np.floor(data/(1/u))*(1/u)
		
	def max_value(data=[]):
		_max = 0
		_max_index = -1
		for i in range(len(data)):
			if abs(data[i])>_max:
				_max_index = i
				_max = abs(data[i])
				
		return abs(data[_max_index])
		
	def avg(data=[], steps=-1):
		if steps <= 0:
			_sum = 0
			
			for v in data:
				_sum+=v
				
			return _sum/len(data)
		else:
			_sum = 0
			stride = int(len(data)/steps)
			
			if stride<=0:
				stride = 1
				
			counter = 0
			divider = 0
			for v in range(steps):
				if counter<len(data):
					_sum+=data[counter]
					divider+=1
				else:
					break

				counter+=stride
		
			return _sum/divider
			
	def entropy(data=[], ground=0, multiplier = 3):
		_sum = 0
		_len = max(1, len(data))
		for v in data:
			_sum+=abs(v-ground)*multiplier
		return min(0.99, _sum/_len)
		
	def rangeFactor(t, point, _range):
		ratio = np.abs (point - t) / _range;
		if ratio < 1:
			return 1 - ratio;
		else:
			return 0;
			
	def get_frequency(signal, zero_thresh=0.5, multiplier=1, auto_thresh=True, differential=False):
		if differential:
			dif = np.diff(signal)
			
			for i in range(len(dif)):
				dif[i] = np.abs(dif[i])
				
			return np.average(dif)*multiplier
		else:
			if(auto_thresh):
				zero_thresh = np.average(signal)
			
			zero_crossings = 0
			for i in range(len(signal)-1):
				if(signal[i]<=zero_thresh and signal[i+1]>zero_thresh) or (signal[i]>=zero_thresh and signal[i+1]<zero_thresh):
					zero_crossings+=1
		 
			return zero_crossings*multiplier
			
	def normalize(sample):
		_max = 0
		for m in sample:
			if abs(m)>_max:
				_max = abs(m)
				
		for i in range(len(sample)):
			sample[i] = sample[i]/_max
		return sample

	def normalize2D(sample):
		_max = 0
		for m in sample:
			for n in m:
				if abs(n)>_max:
					_max = abs(n)
				
		for i in range(len(sample)):
			for j in range(len(sample[i])):
				sample[i][j] = sample[i][j]/_max
		return sample

	def Spectrogram(samples, samplerate):
		from scipy import signal
		frequencies, times, spectogram = signal.spectrogram(samples, len(samples))
		return spectogram

	def Sigmoid(data):
		pass