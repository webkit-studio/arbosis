module.exports = [
  {
    files: ['**/*.js'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'script',
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly',
        location: 'readonly', console: 'readonly', setTimeout: 'readonly',
        setInterval: 'readonly', clearInterval: 'readonly', clearTimeout: 'readonly',
        MutationObserver: 'readonly', IntersectionObserver: 'readonly',
        getComputedStyle: 'readonly', requestAnimationFrame: 'readonly',
        performance: 'readonly', Image: 'readonly', Event: 'readonly',
        Promise: 'readonly', URL: 'readonly',
        module: 'writable', require: 'readonly', __dirname: 'readonly',
        process: 'readonly',
        // sdílené napříč moduly (build.js je slévá do jednoho IIFE)
        SEL: 'readonly', SECTIONS: 'readonly', NAV_OFFSET: 'readonly',
        ANIM: 'readonly', EASE: 'readonly',
        $$: 'readonly', $1: 'readonly', onReady: 'readonly', has: 'readonly',
        nextFrame: 'readonly', onScroll: 'readonly', text: 'readonly',
        formatNumber: 'readonly', push: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-undef': 'error'
    }
  },
  {
    /* Jádro definuje pomocné funkce pro ostatní moduly. Uvnitř sebe je
       nepoužívá — spojí je až build.js do jednoho IIFE, takže hlášení
       o nepoužité proměnné by tu bylo vždycky a jen zašumělo výstup. */
    files: ['src/modules/00-core.js'],
    rules: {
      'no-unused-vars': 'off'
    }
  }
];
