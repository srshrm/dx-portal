/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { setLibs} from './utils.js';

// Add project-wide style path here.
const STYLES = '';

// Use '/libs' if your live site maps '/libs' to milo's origin.
const LIBS = 'https://milo.adobe.com/libs';

// Add any config options.
const CONFIG = {
  // codeRoot: '',
  // contentRoot: '',
  // imsClientId: 'college',
  // geoRouting: 'off',
  // fallbackRouting: 'off',
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    kr: { ietf: 'ko-KR', tk: 'zfo3ouc' },
  },
};

// Load LCP image immediately
(async function loadLCPImage() {
  const lcpImg = document.querySelector('img');
  lcpImg?.removeAttribute('loading');
}());

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

const miloLibs = setLibs(LIBS);

(function loadStyles() {
  const paths = [`${miloLibs}/styles/styles.css`];
  if (STYLES) { paths.push(STYLES); }
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

/**
 * Loads JS and CSS for a block.
 * @param {Element} block The block element
 * @param eager
 */
export async function loadBlock(block, eager = false) {
  if (!(block.getAttribute('data-block-status') === 'loading' || block.getAttribute('data-block-status') === 'loaded')) {
    block.setAttribute('data-block-status', 'loading');
    const blockName = block.getAttribute('data-block-name');
    const { list } = window.milo?.libs?.blocks;
    // Determine if block should be loaded from milo libs
    const isMiloBlock = !!(list && list.includes(blockName));
    const base = isMiloBlock ? window.milo.libs.base : '';
    try {
      const cssLoaded = new Promise((resolve) => {
        loadCSS(`${base}/blocks/${blockName}/${blockName}.css`, resolve);
        if (isMiloBlock) {
          loadCSS(`${base}/styles/variables.css`, resolve);
        }
      });
      const decorationComplete = new Promise((resolve) => {
        (async () => {
          try {
            const mod = await import(`${base}/blocks/${blockName}/${blockName}.js`);
            if (mod.default) {
              await mod.default(block, blockName, document, eager);
            }
          } catch (err) {
            debug(`failed to load module for ${blockName}`, err);
          }
          resolve();
        })();
      });
      await Promise.all([cssLoaded, decorationComplete]);
    } catch (err) {
      debug(`failed to load module for ${blockName}`, err);
    }
    block.setAttribute('data-block-status', 'loaded');
  }
}

/**
 * Loads a CSS file.
 * @param {string} href The path to the CSS file
 * @param callback
 */
export function loadCSS(href, callback) {
  if (!document.querySelector(`head > link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', href);
    if (typeof callback === 'function') {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (typeof callback === 'function') {
    callback('noop');
  }
}

export function debug(message, ...args) {
    console.log(message, ...args);
}

(async function loadPage() {
  const { loadArea, setConfig } = await import(`${miloLibs}/utils/utils.js`);
  /* load footer */
  const footer = document.querySelector('footer');
  footer.setAttribute('data-block-name', 'footer');
  footer.setAttribute('data-footer-source', `footer`);
  loadBlock(footer);
  setConfig({ ...CONFIG, miloLibs });
  await loadArea();
}());
