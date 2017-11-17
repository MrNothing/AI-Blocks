import sys
from PIL import Image
import tempfile
import numpy as np

#Built with AIBlocks

NaN = None

def Log(msg, flush=True):
	print(msg)
	if EDITOR_MODE:
		sys.stdout.flush()
		sys.stderr.flush()

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
def SendImageData(id, data, width=32, height=32, name="", rgba=False, flush=True):
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
			pixels[x,height-y-1] = (int(pixel[0]*255), int(pixel[1]*255), int(pixel[2]*255), 255) # set the colour accordingly


		tmpDir = tempfile.gettempdir()
		imgPath = str(tmpDir)+"/"+name+"_out_"+str(id)+".jpg"
		img.save(imgPath)
		
		Log("img_data,"+str(id)+","+imgPath+","+name, flush)