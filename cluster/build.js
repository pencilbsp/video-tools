import fs from "fs";
import path from "path";

// NodeJS Build
const NODE_FIX =
    'import{createRequire as r}from"module";import.meta.require||=e=>r(import.meta.url)(e);var require=r(import.meta.url);';
const BUILD_DIR = "build";
const nodeBuild = await Bun.build({
    entrypoints: ["./app.js"],
    target: "node",
    minify: true,
    naming: "[dir]/[name].[ext]",
});

// Write output files
for (const result of nodeBuild.outputs) {
    const fileContent = NODE_FIX + (await result.text());
    const destDir = path.join(import.meta.dir, BUILD_DIR);
    const dest = path.join(destDir, result.path);
    fs.existsSync(destDir) || fs.mkdirSync(destDir);
    Bun.write(dest, fileContent);
}
