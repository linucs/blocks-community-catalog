#!/usr/bin/env node
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, relative } from 'path';
import yaml from 'js-yaml';

const REPO_OWNER = 'linucs';
const REPO_NAME = 'blocks-community-catalog';
const BRANCH = 'main';
const CATALOGS_DIR = 'catalogs';

async function collectYamlFiles(dir) {
    const results = [];
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...await collectYamlFiles(fullPath));
        } else if (/\.ya?ml$/i.test(entry.name)) {
            results.push(fullPath);
        }
    }
    return results;
}

async function main() {
    const rootDir = process.cwd();
    const catalogsDir = join(rootDir, CATALOGS_DIR);

    try {
        await stat(catalogsDir);
    } catch {
        console.log('No catalogs/ directory found. Writing empty index.');
        await writeFile(join(rootDir, 'index.json'), JSON.stringify({ version: 1, generated: new Date().toISOString(), entries: [] }, null, 2));
        return;
    }

    const files = await collectYamlFiles(catalogsDir);
    const entries = [];

    for (const file of files) {
        try {
            const content = await readFile(file, 'utf-8');
            const docs = yaml.loadAll(content);

            for (const doc of docs) {
                if (!doc || !doc.id || !doc.implementations) continue;

                const relPath = relative(rootDir, file).replace(/\\/g, '/');
                const runtimes = [...new Set(doc.implementations.map(i => i.runtime))];
                const targets = [...new Set(doc.implementations.flatMap(i => i.targets || []))];
                const blockCount = doc.implementations.reduce((sum, i) => sum + (i.blocks?.length || 0), 0);

                entries.push({
                    id: doc.id,
                    category: doc.category || '',
                    description: doc.description,
                    runtimes,
                    targets,
                    blockCount,
                    path: relPath,
                    downloadUrl: `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${relPath}`,
                });
            }
        } catch (err) {
            console.warn(`Warning: failed to parse ${file}: ${err.message}`);
        }
    }

    entries.sort((a, b) => a.id.localeCompare(b.id));

    const index = {
        version: 1,
        generated: new Date().toISOString(),
        entries,
    };

    await writeFile(join(rootDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');
    console.log(`Built index.json with ${entries.length} entries.`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
