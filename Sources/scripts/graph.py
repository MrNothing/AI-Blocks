#description Create your own custom model
#icon fa fa-cubes

#param array|object
model_elements = []

def Run(self, graph, reuse=False):
	for e in range(len(self.model_elements)):
		graph = self.model_elements[e].Run(graph, reuse=reuse)
	return graph

def GetChild(self, i):
	return self.model_elements[i]

def GetAllWeightsCount(self):
	sum = 0
	for i in range(len(self.model_elements)):
		obj = self.model_elements[i]
		if hasattr(obj, 'total_weights'):
			sum+=obj.total_weights

	return sum

def getVariables(self):
	variables = []
	for i in range(len(self.model_elements)):
		obj = self.model_elements[i]
		if hasattr(obj, 'variables'):
			variables+=obj.variables

	return variables

def getInputSize(self):
	if hasattr(model_elements[0], 'hidden_units'):
		return model_elements[0].hidden_units[0]
	else:
		LogErr("No hidden units found in graph: "+str(self.id))
		return None

def GetOutputSize(self):
	if hasattr(model_elements[len(model_elements)-1], 'hidden_units'):
		return model_elements[len(model_elements)-1].hidden_units[len(model_elements[len(model_elements)-1].hidden_units)-1]
	else:
		LogErr("No hidden units found in graph: "+str(self.id))
		return None