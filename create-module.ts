import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';

// Get the name of the new module
const moduleName = process.argv[2].toLowerCase();
const capitalizedModuleName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
console.log('Creating module: ', moduleName);

// Templates for new files
const frontEndActionTemplate = `
export const ${moduleName}ActionHash = {
  "${moduleName}-template": templateAction,
};

function templateAction(params, component) {
  console.log("Template", params);
}
`;

const componentTemplate = `
import React from 'react';

export function ${capitalizedModuleName}({ moduleState }) {
  return (
    <div>
      <h3>${capitalizedModuleName}</h3>
      <p>This is a module template</p>
    </div>
  );
}
`;

const maestroActionTemplate = `
export const ${moduleName}ActionHash = {
  '${moduleName}-template': () => console.warn('TEMPLATE'),
};
`;

// Functions for the front end

const createComponent = (repoName) => {
  console.log(`Creating component in ${repoName}`);
  const dir = `../${repoName}/src/components/modules/${capitalizedModuleName}`;
  if (!existsSync(dir)) {
    mkdirSync(dir);
  }
  writeFileSync(`${dir}/index.js`, componentTemplate);
};

const updateFontEndMasterActionHash = (repoName) => {
  console.log('Updating master action hash in', repoName);
  const dir = `../${repoName}/src/actions/modules/index.js`;
  const file = readFileSync(dir, { encoding: 'utf8' });
  const splitString = 'export const moduleActionHash = {';
  const splitFile = file.split(splitString);
  const output =
    splitFile[0] +
    `import { ${moduleName}ActionHash } from './${moduleName}';\n\n` +
    splitString +
    `\n  ...${moduleName}ActionHash,` +
    splitFile[1];

  writeFileSync(`./${dir}`, output);
};

const updateFrontEndComponentIndex = (repoName) => {
  console.log('Updating module index component in', repoName);
  const dir = `../${repoName}/src/components/modules/index.js`;
  const file = readFileSync(dir, { encoding: 'utf8' });
  const importSplitString = `import React from 'react';`;
  const importSplit = file.split(importSplitString);
  const withImport =
    importSplitString + `\nimport { ${capitalizedModuleName} } from './${capitalizedModuleName}/';` + importSplit[1];
  const componentSplitString = '  const moduleHash = {';
  const componentSplit = withImport.split(componentSplitString);
  const output =
    componentSplit[0] +
    componentSplitString +
    `\n    ${moduleName}: <${capitalizedModuleName} moduleState={moduleState} />,` +
    componentSplit[1];

  writeFileSync(`./${dir}`, output);
};

const frontEndCreateAndUpdate = () => {
  const frontEndRepos = ['control', 'crowd', 'display'];

  frontEndRepos.forEach((repoName) => {
    createComponent(repoName);
    console.log(`Creating module actionHash in ${repoName}`);
    writeFileSync(`../${repoName}/src/actions/modules/${moduleName}.js`, frontEndActionTemplate);
    updateFontEndMasterActionHash(repoName);
    updateFrontEndComponentIndex(repoName);
  });
};

// Functions for the back end

const updateMaestroModuleIndex = () => {
  console.log('Updating Maestor Module Index');
  const dir = 'app/actions/modules/index.ts';
  const file = readFileSync(dir, { encoding: 'utf8' });
  const importSplitString = `import { IActionElements } from '../';`;
  const importSplit = file.split(importSplitString);
  const withImport =
    importSplit[0] +
    `import { ${moduleName}ActionHash } from './${moduleName}';\n` +
    importSplitString +
    importSplit[1];
  const actionSplitString = 'export const moduleActionHash = {';
  const actionSplit = withImport.split(actionSplitString);
  const output = actionSplit[0] + actionSplitString + `\n  ...${moduleName}ActionHash,` + actionSplit[1];
  writeFileSync(`./${dir}`, output);
};

const maestroCreateAndUpdate = () => {
  console.log(`Creating ${moduleName} actionHash in maestro`);
  const maestroActionDir = `./app/actions/modules/${moduleName}`;
  if (!existsSync(maestroActionDir)) {
    mkdirSync(maestroActionDir);
  }
  writeFileSync(`${maestroActionDir}/index.ts`, maestroActionTemplate);
  updateMaestroModuleIndex();
};

//// EXECUTE! ////

console.log(maestroCreateAndUpdate);
// maestroCreateAndUpdate();
frontEndCreateAndUpdate();
