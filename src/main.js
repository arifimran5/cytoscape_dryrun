import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'

cytoscape.use(dagre)

document.getElementById('addbtn').addEventListener('click', addNode)

let cy = cytoscape({
	container: document.getElementById('cy'),
	elements: [],
	style: [
		{
			selector: 'node',
			style: {
				'background-color': '#666',
				label: 'data(label)',
			},
		},
		{
			selector: 'edge',
			style: {
				width: 3,
				'line-color': '#ccc',
				'target-arrow-color': '#ccc',
				'target-arrow-shape': 'triangle',
			},
		},
	],
	layout: {
		name: 'dagre',
		rankDir: 'TB',
	},
})

let treeData = []
let nodeCount = 0

function addNode(e) {
	e.preventDefault()
	const inputData = document.getElementById('newNodeData').value.trim()

	if (inputData === 'null') {
		treeData.push(null) // Push null to maintain level order
		nodeCount++
	} else {
		const newNodeValue = parseFloat(inputData)

		if (!isNaN(newNodeValue)) {
			const newNodeId = newNodeValue.toString() // Unique node ID
			const newNode = { data: { id: newNodeId, label: newNodeValue } }

			let parentNodeId = null
			if (nodeCount > 0) {
				// Determine the parent based on level order
				let parentIndex = Math.floor((nodeCount - 1) / 2)

				// TODO Find the nearest non-null parent.
				while (parentIndex >= 0 && treeData[parentIndex] === null) {
					parentIndex--
				}

				if (parentIndex >= 0) {
					parentNodeId = treeData[parentIndex]
				}
			}

			let newEdge = null
			if (parentNodeId) {
				newEdge = { data: { source: parentNodeId, target: newNodeId } }
			}

			cy.startBatch()
			cy.add(newNode)
			if (newEdge) {
				cy.add(newEdge)
			}
			cy.endBatch()

			treeData.push(newNodeId) // Add to the tree data array
			nodeCount++

			runLayout()
		} else {
			alert("Invalid input. Please enter 'null' or a number.")
		}
	}

	document.getElementById('newNodeData').value = ''
}

function runLayout() {
	const layout = cy.layout({
		name: 'dagre',
		rankDir: 'TB',
	})
	layout.run()
}
