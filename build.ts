console.log("📦 Starting library build...");

try {
	const rm = Bun.spawnSync(["rm", "-rf", "./dist"]);
	if (!rm.success) {
		Bun.spawnSync([
			"powershell",
			"-Command",
			"if (Test-Path ./dist) { Remove-Item -Recurse -Force ./dist }",
		]);
	}
} catch {}

const result = await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	target: "node",
	format: "esm",
	minify: true,
	sourcemap: "external",
	external: ["elysia", "@sinclair/typebox"],
});

if (!result.success) {
	console.error("❌ Code build failed:", result.logs);
	process.exit(1);
}

console.log("✨ JS code and source maps built successfully in /dist");

console.log("📝 Generating type definition files (.d.ts)...");
const tsc = Bun.spawnSync(["bunx", "tsc", "-p", "tsconfig.build.json"]);

if (!tsc.success) {
	console.error("❌ Type generation failed:");
	const output = tsc.stdout?.toString() || tsc.stderr?.toString();
	console.error(output || "Unknown TypeScript compilation error.");
	process.exit(1);
}

console.log("🚀 Library is ready for publishing!");
