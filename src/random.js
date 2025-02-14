import cytoscape from 'cytoscape'

let cy = cytoscape({
	container: document.getElementById('cy'),
	elements: {
		nodes: [
			{
				data: {
					id: 'a',
				},
			},
			{
				data: {
					id: 'b',
				},
			},
		],
		edges: [
			{
				data: {
					id: 'ab',
					source: 'a',
					target: 'b',
				},
			},
			{
				data: {
					id: 'ba',
					source: 'b',
					target: 'a',
				},
			},
		],
	},

	layout: {
		name: 'grid',
		rows: 1,
	},

	// so we can see the ids
	style: [
		{
			selector: 'node',
			style: {
				label: 'data(id)',
				'background-color': 'red',
				shape: 'hexagon',
			},
		},
		{
			selector: 'edge',
			style: {
				label: 'data(id)',
				'line-color': 'blue',
				'target-arrow-color': 'green',
				'target-arrow-shape': 'triangle',
				'curve-style': 'segments',
				'border-join': 'bevel',
			},
		},
	],
})

let newElems = cy.add([
	{
		group: 'nodes',
		data: {
			id: 'c',
		},
		position: { x: 200, y: 200 },
	},
	{
		group: 'edges',
		data: {
			id: 'bc',
			source: 'b',
			target: 'c',
		},
	},
])

let ids = newElems.collection().data('id')

let neighbs = newElems.neighbourhood()

neighbs.nodes().style('background-color', 'pink')
