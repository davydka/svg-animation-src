const lodash = require('lodash');
const glob = require('glob');
const path = require('path');

const ROOT = process.cwd();
const GENERATORS_DIR = path.join(ROOT, 'site/_svgs/generators');

const listGenerators = dir => glob.sync(`${GENERATORS_DIR}/${dir}/**/*.js`);

const getHomeUrl = dirName => {
  const page = Math.ceil(parseInt(dirName, 10) / 10);
  return page === 1 ? `/#${dirName}` : `/page-${page}/#${dirName}`;
};

const generateCommonData = generatorPath => {
  const modulePath = require.resolve(generatorPath);
  delete require.cache[modulePath];
  const generator = require(modulePath);

  const [, dirName, fileName] = /([\d\w]+)\/(\w+)\.js$/.exec(generatorPath);
  const id = `${dirName}-${fileName}`;
  const svg = generator(id);

  return {
    id,
    dirName,
    fileName,
    homeUrl: getHomeUrl(dirName),
    url: `/${dirName}/${fileName}/`,
    rawXML: svg.render({
      namespace: `svg-${id}`,
    }),
    minXML: svg.render({
      namespace: `svg-${id}`,
      minified: true,
    }),
  };
};

const getAnimations = () => {
  const list = listGenerators('animations')
    .map(generateCommonData)
    .sort((a, b) => a.id.localeCompare(b.id));
  const dirs = {};

  list.forEach((data, index) => {
    const { dirName } = data;

    if (list[index - 1]) {
      data.previous = list[index - 1];
    }

    if (list[index + 1]) {
      data.next = list[index + 1];
    }

    dirs[dirName] = dirs[dirName] || {
      name: dirName,
      homeUrl: getHomeUrl(dirName),
      list: [],
      url: `/${dirName}/`,
    };
    dirs[dirName].list.push(data);
  });

  const dirArr = Object.keys(dirs)
    .sort()
    .map(key => dirs[key])
    .map((dir, index, allDirs) =>
      Object.assign(
        {
          index,
          prev: allDirs[index - 1] ? allDirs[index - 1] : null,
          next: allDirs[index + 1] ? allDirs[index + 1] : null,
        },
        dir,
      ),
    );

  list.forEach(data => {
    data.dir = dirArr.find(({ name }) => data.dirName === name);
  });

  return {
    list,
    dirs: dirArr,
  };
};

const getMisc = () =>
  listGenerators('misc')
    .map(generateCommonData)
    .reduce((acc, data) => Object.assign(acc, { [data.fileName]: data }), {});

module.exports = () => ({
  animations: getAnimations(),
  misc: getMisc(),
});
