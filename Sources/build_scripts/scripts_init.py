
	def GetDynamicValue(self, param_name):
		if EDITOR_MODE:
			try:
				tmpDir = _aiblocks_default_tmp_folder+"\\variables_"+self.id
				file = open(tmpDir,"r") 
				lines = file.readlines()

				name = None
				type = None
				val = None
				
				found = False
				current = 0
				for i in range(len(lines)):
					if current==0:
						name = lines[i].replace("\n", "")
						current = 1
					elif current==1:
						type = lines[i].replace("\n", "")
						current = 2
					else:
						val = lines[i].replace("\n", "")
						current = 0

						var = self._aiblocks_parseVal(val, type)
						self._aiblocks_vars_cache[name] = var

						if param_name==name:
							return var
							found = True
				if not found:
					if self._aiblocks_vars_cache.__contains__(param_name):
						return self._aiblocks_vars_cache[param_name]
					else:
						raise Exception("Dynamic editor variable was not found: "+param_name)
			except:
				LogErr("Warning: Dynamic vars were not found for object: "+self.id)
				return getattr(self, param_name)

		else:
			return getattr(self, param_name)


	def _aiblocks_parseVal(self, val, type):
		if(type=="int"):
			return int(val)
		elif(type=="float"):
			return float(val)
		elif(type=="array"):
			return eval(val)
		else:
			return val
		