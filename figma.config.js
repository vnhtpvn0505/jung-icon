require('dotenv').config();
const path = require('path');

const svgo = require('@figma-export/transform-svg-with-svgo');
const template = require('./svgr-icon-template');
const fileId = process.env.FILE_ID;
const capitalize = (s) => {
  return s.split('-').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join('');
};
const outputters = [
  require('@figma-export/output-components-as-svg')({
    output: './svg',
    getDirname: (options) => `${options.pageName}${path.sep}${options.dirname}`,
    getBasename: (options) => `${options.basename}.svg`,

    }),
  require('@figma-export/output-components-as-svgr')({
    getFileExtension: () => '.tsx',
    getComponentName: ({ componentName, pageName }) => {
      if (pageName === 'outline') {
        return capitalize(componentName) + 'Icon';
      }
      return capitalize(componentName) + capitalize(pageName) + 'Icon';
    },
    getSvgrConfig: () => ({
      typescript: true,
      svgProps: {
        width: '{_width}',
        height: '{_height}',
        role: 'img',
      },
      replaceAttrValues: {
        currentColor: '{color || "var(--expo-theme-icon-default)"}',
      },
      template,
    }),
    output: './src',
  }),
];

/** @type {import('svgo').PluginConfig[]} */
const solidSVGOConfig = [
  {
    name: 'removeDimensions',
    active: false
  },
  {
    name: 'sortAttrs',
    params: {
      stroke: "currentColor"
    }
  },
  { name: 'reusePaths', active: true },
  {
    name: 'removeAttrs',
    params: {
      attrs: "fill"
    }
  },
  {
    name: 'addAttributesToSVGElement',
    params: {
      attribute: {
        fill: "currentColor",
        stroke: "currentColor"
      }
    }
  }
];

/** @type {import('svgo').PluginConfig[]} */
const outlineSVGOConfig = [
  {
    name: 'removeDimensions',
    active: true,
  },
  {
    name: "convertStyleToAttrs",
    params: {
      keepImportant: false
    }
  },
  {
    name: "sortAttrs",
    params: {
      order: ["id","width","height","x","x1","x2","y","y1","y2","cx","cy","r","fill","stroke","marker","d","points"],
      xmlnsOrder: "front"
    }
  },
  {
    name: 'addAttributesToSVGElement',
    params: {
      attribute: {
        stroke: 'currentColor',
      },
    },
  },
];

/** @type {import('@figma-export/types').FigmaExportRC} */
module.exports = {
  commands: [
    [
      'components',
      {
        fileId,
        onlyFromPages: ['outline'],
        transformers: [svgo({ multipass: true, plugins: outlineSVGOConfig })],
        outputters,
      },
    ],
    [
      'components',
      {
        fileId,
        onlyFromPages: ['solid'],
        transformers: [svgo({ multipass: true, plugins: solidSVGOConfig })],
        outputters,
      },
    ]
  ],
};
