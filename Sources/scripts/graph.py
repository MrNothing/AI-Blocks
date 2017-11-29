#description Create your own custom model
#icon fa fa-cubes

#param array|object
model_elements = []

def Run(self, graph):
	for e in range(len(self.model_elements)):
		graph = self.model_elements[e].Run(graph)
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

def GetVariables(self):
	variables = []
	for i in range(len(self.model_elements)):
		obj = self.model_elements[i]
		if hasattr(obj, 'variables'):
			variables+=obj.variables

	return variables
