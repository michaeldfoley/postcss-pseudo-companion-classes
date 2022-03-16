/**
 * @typedef {object} Options 
 * @property {string[]} [exclude] - pseudo-classes to skip
 * @property {string[]} [restrictTo] - only create classes for a restricted list of selectors
 * @property {boolean} [allCombinations] - when multiple pseudo-classes are present (ie `:hover:focus`), 
 * output classes for each combination
 * @property {boolean} [isModule] - wrap companion classes in `:global()` to prevent them from being renamed
 * @property {string} [prefix] - prefix for the companion class
 */

/** 
 * @type {import('postcss').PluginCreator<Options>}
 */
module.exports = (options = {}) => {
  const {
    exclude = [':before', ':after'],
    restrictTo,
    allCombinations = false,
    isModule = false,
    prefix = '\\:',
  } = options

  /**
   * Adds a leading colon if missing and removes any content in ()
   * @param {string} pseudoClass 
   * @returns string
   */
  const standardizePseudoClass = (pseudoClass) => 
    (pseudoClass.charAt(0) === ':' ? '' : ':') + pseudoClass.replace(/\(.*/g, '')
  
  /**
   * Reduces an array to an object with the array item as the key
   * @param {Object.<string, boolean>} dict 
   * @param {string} pseudoClass 
   * @returns {Object.<string, boolean>}
   */
  const toDict = (dict, pseudoClass) => {
    dict[standardizePseudoClass(pseudoClass)] = true
    return dict
  }
  
  /**
   * Is the item in the excluded dictionary
   * @param {string} item 
   * @returns boolean
   */
  const isExcluded = (item) => !!excludeDict[item]

  const excludeDict = (exclude || []).reduce(toDict, {
    ':root': true,
    ':host': true,
    ':host-context': true,
    ':global': true,
  })

  const restrictToDict = Array.isArray(restrictTo) && restrictTo.length
    ? restrictTo.reduce(toDict, {})
    : null

  return {
    postcssPlugin: 'postcss-pseudo-companion-classes',

    Once (css) {
      css.walkRules(rule => {
        rule.selectors.forEach((selector) => {
          if (isExcluded(selector)) {
            return
          }

          const selectorParts = selector.split(' ')
          const pseudoedSelectorParts = []

          selectorParts.forEach((selectorPart, index) => {
            const pseudos = selectorPart.match(/::?([^:]+)/g)

            if (!pseudos) {
              pseudoedSelectorParts.push(allCombinations ? [selectorPart] : selectorPart)
              return
            }

            const baseSelector = selectorPart.slice(
              0,
              selectorPart.length - pseudos.join('').length,
            )

            const classPseudos = pseudos.map((pseudo) => {
              const pseudoToCheck = pseudo
                .replace(/\(.*/g, '')
                .replace(/\)/g, '')
                .replace('::', ':')

              // restrictTo a subset of pseudo-classes
              if (
                excludeDict[pseudoToCheck] ||
                pseudoToCheck.split('.').some(isExcluded) ||
                pseudoToCheck.split('#').some(isExcluded) ||
                restrictToDict &&
                !restrictToDict[pseudoToCheck]
              ) {
                return pseudo
              }

              pseudo = pseudo
                .replace(/^::?/, '')
                .replace(/\(/g, '\\(')
                .replace(/\)/g, '\\)')

              
              const prefixedPseudoClass = `.${prefix}${pseudo}`

              // Wrap class in :global() to prevent css module rename
              return isModule ? `:global(${prefixedPseudoClass})` : prefixedPseudoClass
            })

            // Add all combinations of pseudo-classes/pseudo styles given a selector with multiple pseudo styles.
            if (allCombinations) {
              const combinations = createCombinations(pseudos, classPseudos)
              pseudoedSelectorParts[index] = []

              combinations.forEach((combination) => {
                pseudoedSelectorParts[index].push(baseSelector + combination)
              })
            } else {
              pseudoedSelectorParts.push(baseSelector + classPseudos.join(''))
            }
          })

          if (allCombinations) {
            const serialCombinations = createSerialCombinations(pseudoedSelectorParts)

            serialCombinations.forEach((combination) => {
              addSelector(combination)
            })
          } else {
            addSelector(pseudoedSelectorParts.join(' '))
          }

          function addSelector(newSelector) {
            if (newSelector && newSelector !== selector) {
              rule.selector += ',\n' + newSelector
            }
          }
        })
      })
    },
  }
}

// a.length === b.length
function createCombinations(a, b) {
  let combinations = ['']
  let newCombinations
  for (let i = 0, len = a.length; i < len; i += 1) {
    newCombinations = []
    combinations.forEach((combination) => {
      newCombinations.push(combination + a[i])
      // Don't repeat work.
      if (a[i] !== b[i]) {
        newCombinations.push(combination + b[i])
      }
    })
    combinations = newCombinations
  }
  return combinations
}

/**
 * 
 * @param {string[][]} selectorParts 
 * @param {string} [selector]
 * @returns string[]
 */
function createSerialCombinations(selectorParts, selector = '') {
  if (!selectorParts.length) {
    return selector
  }
  return selectorParts[0].flatMap((value) => (
    createSerialCombinations(selectorParts.slice(1), concatWithSpace(selector, value))
  ), [])
}

/**
 * @param  {string[]} items 
 * @returns string
 */
function concatWithSpace(...items) {
  return items.filter(Boolean).join(' ')
}


module.exports.postcss = true
