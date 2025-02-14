export default {
	root: './src',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				index: './src/index.html',
				got: './src/got.html',
			},
		},
	},
}
