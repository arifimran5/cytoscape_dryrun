import cytoscape from 'cytoscape'

async function fetchCharacters() {
	try {
		const res = await fetch(
			'https://raw.githubusercontent.com/jeffreylancaster/game-of-thrones/refs/heads/master/data/characters.json'
		)
		return await res.json()
	} catch (error) {
		console.error('Error loading JSON:', error)
	}
}

fetchCharacters().then((d) => {
	const characters = d.characters

	// Initialize Cytoscape elements
	const elements = []

	// Create a Set of all character names for quick lookup
	const characterNames = new Set(
		characters.map((character) => character.characterName)
	)

	// Add nodes (characters)
	characters.forEach((character) => {
		const placeholderImage = 'https://placehold.co/60'
		const image = character.characterImageThumb || placeholderImage

		elements.push({
			data: {
				id: character.characterName,
				label: character.characterName,
				image: image,
			},
		})
	})

	const existingEdges = new Set()
	// Create a Set to track nodes with relationships
	const nodesWithRelationships = new Set()

	// Add edges (relationships)
	characters.forEach((character) => {
		const characterName = character.characterName

		// Parent-child relationships (solid lines)
		if (character.parents) {
			character.parents.forEach((parent) => {
				if (characterNames.has(parent)) {
					elements.push({
						data: {
							source: parent,
							target: characterName,
							relationship: 'parent-child',
							lineStyle: 'solid',
						},
					})

					nodesWithRelationships.add(parent)
					nodesWithRelationships.add(characterName)
				} else {
					console.warn(
						`Skipping edge: Parent "${parent}" not found for character "${characterName}".`
					)
				}
			})
		}

		// if (character.parentOf) {
		// 	character.parentOf.forEach((child) => {
		// 		if (characterNames.has(child)) {
		// 			elements.push({
		// 				data: {
		// 					source: characterName,
		// 					target: child,
		// 					relationship: 'parent-child',
		// 					lineStyle: 'solid',
		// 				},
		// 			})
		// 		} else {
		// 			console.warn(
		// 				`Skipping edge: Child "${child}" not found for character "${characterName}".`
		// 			)
		// 		}
		// 	})
		// }

		// Spouse relationships (dashed lines)
		if (character.marriedEngaged) {
			character.marriedEngaged.forEach((spouse) => {
				if (characterNames.has(spouse)) {
					// Create a unique key for the edge (sorted source and target)
					const edgeKey = [characterName, spouse].sort().join('|')

					// Check if the edge already exists
					if (!existingEdges.has(edgeKey)) {
						elements.push({
							data: {
								source: characterName,
								target: spouse,
								relationship: 'spouse',
								lineStyle: 'dashed',
							},
						})

						// Track nodes with relationships
						nodesWithRelationships.add(characterName)
						nodesWithRelationships.add(spouse)

						// Add the edge key to the set to avoid duplicates
						existingEdges.add(edgeKey)
					}
				} else {
					console.warn(
						`Skipping edge: Spouse "${spouse}" not found for character "${characterName}".`
					)
				}
			})
		}
	})

	// Initialize Cytoscape
	const cy = cytoscape({
		container: document.getElementById('cy'),
		elements: elements,
		style: [
			// Node style
			{
				selector: 'node',
				style: {
					label: 'data(label)',
					'text-valign': 'bottom', // Place label below the image
					'text-halign': 'center',
					'font-size': '12px',
					'background-image': 'data(image)',
					'background-fit': 'cover',
					'background-opacity': 0, // Hide the default background
					width: 60,
					height: 60,
					'border-width': 2,
					'border-color': '#333',
					'border-opacity': 1,
				},
			},
			{
				selector: 'edge[lineStyle = "solid"]',
				style: {
					width: 2,
					'line-color': '#333',
					'curve-style': 'bezier',
					'line-style': 'solid',
					'target-arrow-shape': 'triangle',
				},
			},
			{
				selector: 'edge[lineStyle = "dashed"]',
				style: {
					width: 2,
					'line-color': '#FF6F91', // Pink for spouse relationships
					'curve-style': 'bezier',
					'line-style': 'dashed',
				},
			},
		],
		layout: {
			name: 'cose', // Force-directed layout
			fit: true,
			padding: 10,
			animate: true,
			randomize: true,
		},
	})

	const toggleButton = document.getElementById('toggleButton')
	let showIsolated = true // Track the current state

	toggleButton.addEventListener('click', () => {
		showIsolated = !showIsolated // Toggle the state

		// Update button text
		toggleButton.textContent = showIsolated
			? 'Hide Isolated Characters'
			: 'Show Isolated Characters'

		cy.nodes().forEach((node) => {
			if (!nodesWithRelationships.has(node.id())) {
				// Isolated node
				node.style('display', showIsolated ? 'element' : 'none')
			}
		})
	})

	// Populate the select menus
	const character1Select = document.getElementById('character1')
	const character2Select = document.getElementById('character2')

	characters.forEach((character) => {
		const option = document.createElement('option')
		option.value = character.characterName
		option.textContent = character.characterName
		character1Select.appendChild(option.cloneNode(true))
		character2Select.appendChild(option)
	})

	// Check relationship button
	const checkRelationshipButton = document.getElementById('checkRelationship')
	const resultDiv = document.getElementById('result')

	checkRelationshipButton.addEventListener('click', () => {
		const character1 = character1Select.value
		const character2 = character2Select.value

		if (!character1 || !character2) {
			resultDiv.textContent = 'Please select both characters.'
			return
		}

		// Check if the characters are related
		const related = areCharactersRelated(cy, character1, character2)
		resultDiv.textContent =
			related.length > 0
				? `Yes, ${character1} and ${character2} are related!`
				: `No, ${character1} and ${character2} are not related.`
	})

	// Function to check if two characters are related
	function areCharactersRelated(cy, character1, character2) {
		// Get the nodes for the selected characters
		const node1 = cy.getElementById(character1)
		const node2 = cy.getElementById(character2)

		// Check if there is a path between the two nodes
		const path = cy.elements().bfs({
			roots: node1,
			visit: (v) => {
				if (v.id() === node2.id()) return true
			},
			directed: false,
		})

		return path.found
	}
})
