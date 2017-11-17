#description Socket server
#icon fa fa-plug

import socket
import _thread as thread
from multiprocessing import Process, Lock, Manager, Value
import traceback

#param string
host = "127.0.0.1"
#param int
port = 15000
#param object
event_listener = None
#param bool
debug = False
#param float
tick_interval = 0.1
#param eval
buffer_size = 1024*512

lock = Lock()
thread.start_new_thread(self.Init, (lock, None))
if self.debug:
	Log ("Server Thread started, id: "+str(self.id))

def Init(self, lock, tmp):
	try:
		self.mySocket = socket.socket()
		self.mySocket.bind((self.host,self.port))
		self.mySocket.listen(1)
		conn, addr = self.mySocket.accept()
		self.conn = conn
		if self.debug:
			Log ("Connection from: " + str(addr))
		while True:
			data = conn.recv(self.buffer_size).decode()
			if not data:
					break
			if self.debug:
				Log ("from connected  user: " + str(data))
			
			data = str(data)
			if self.event_listener:
				self.event_listener.onData(data)
			else:
				Log("event_listener: "+str(self.event_listener))

			if self.debug:
				Log ("recieved data: " + str(data))
			time.sleep(self.tick_interval)
				
		conn.close()
	except Exception as e:
		exc_type, exc_value, exc_traceback = sys.exc_info()
		LogErr (str(exc_type))
		LogErr (str(e))

		trace = ''.join(traceback.format_tb(exc_traceback)).replace("\n", "")

		LogErr (trace)
		Log ("Thread stopped: "+str(self.id))

def Send(self, msg):
	if self.debug:
		Log ("sending: " + str(msg))
	self.conn.send(msg.encode())