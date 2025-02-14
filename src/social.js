import cytoscape from 'cytoscape'

const data = {
	nodes: [
		{ data: { id: 'Alice', name: 'Alice', age: 25, gender: 'female' } },
		{ data: { id: 'Bob', name: 'Bob', age: 30, gender: 'male' } },
		{ data: { id: 'Charlie', name: 'Charlie', age: 28, gender: 'male' } },
		{ data: { id: 'Diana', name: 'Diana', age: 22, gender: 'female' } },
		{ data: { id: 'Eve', name: 'Eve', age: 27, gender: 'female' } },
		{ data: { id: 'Frank', name: 'Frank', age: 35, gender: 'male' } },
	],
	edges: [
		{ data: { source: 'Alice', target: 'Bob', interaction: 'friends' } },
		{
			data: {
				source: 'Alice',
				target: 'Charlie',
				interaction: 'collaborators',
			},
		},
		{ data: { source: 'Bob', target: 'Diana', interaction: 'friends' } },
		{ data: { source: 'Charlie', target: 'Eve', interaction: 'friends' } },
		{ data: { source: 'Diana', target: 'Eve', interaction: 'collaborators' } },
		{ data: { source: 'Eve', target: 'Frank', interaction: 'friends' } },
		{
			data: { source: 'Frank', target: 'Alice', interaction: 'collaborators' },
		},
	],
}

const cy = cytoscape({
	container: document.getElementById('cy'),
	elements: data,
	style: [
		{
			selector: 'node',
			style: {
				label: 'data(name)',
				'background-color': '#6FB1FC',
				'text-valign': 'center',
				'text-halign': 'center',
				'font-size': '3px',
				width: '10px',
				height: '10px',
			},
		},
		{
			selector: 'edge',
			style: {
				width: 2,
				'line-color': '#A0A0A0',
				'curve-style': 'bezier',
				// label: 'data(interaction)',
				'font-size': '3px',
			},
		},
		{
			selector: 'node[gender = "male"]',
			style: {
				'background-color': '#6FB1FC',
			},
		},
		{
			selector: 'node[gender = "female"]',
			style: {
				'background-color': '#FF6F91',
			},
		},
		{
			selector: 'edge[interaction = "friends"]',
			style: {
				'line-color': '#2323ff',
			},
		},
		{
			selector: 'edge[interaction = "collaborators"]',
			style: {
				'line-color': '#edff23',
			},
		},
	],
	layout: {
		name: 'cose',
		fit: true,
		padding: 10,
		animate: true,
	},
})
