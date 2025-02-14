import cytoscape from 'cytoscape'

fetch(
	'https://raw.githubusercontent.com/jeffreylancaster/game-of-thrones/refs/heads/master/data/characters.json'
)
	.then((response) => response.json())
	.then((data) => {
		const characters = data.characters

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
						'background-image': 'data(image)', // Use thumbnail image URL
						'background-fit': 'cover', // Ensure the image covers the node
						'background-opacity': 0, // Hide the default background
						width: 60, // Set node size
						height: 60,
						'border-width': 2,
						'border-color': '#333',
						'border-opacity': 1,
					},
				},
				// Edge style for parent-child (solid lines)
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
				// Edge style for spouse (dashed lines)
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

			// Filter nodes based on whether they have edges
			cy.nodes().forEach((node) => {
				if (!nodesWithRelationships.has(node.id())) {
					// Isolated node
					node.style('display', showIsolated ? 'element' : 'none')
				}
			})
		})
	})
	.catch((error) => console.error('Error loading JSON:', error))
