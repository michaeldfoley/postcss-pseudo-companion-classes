const postcss = require('postcss')
const { readFileSync } = require('fs')
const { join } = require('path')

const plugin = require('..')

function read(fileName) {
  return readFileSync(join(__dirname, fileName), 'utf-8')
}

async function run (input, output, opts) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output.trim())
  expect(result.warnings()).toHaveLength(0)
}

const input = read('./fixtures/input.css')

describe('postcss companion pseudo-classes', () => {

  it('should add proper companion classes', async () => {
    const expectedOut = read('./fixtures/pseudos.out.css')
    await run(input, expectedOut)
  })

  it('should add all combinations (slower) of pseudo-classes if the `allCombinations` option is set', async () => {
    const expectedOut = read('./fixtures/allCombinations.out.css')
    await run(input, expectedOut, { allCombinations: true })
  })

  it('should add companion classes only for the pseudo-classes on the `restrictTo` list', async () => {
    const expectedOut = read('./fixtures/restrictTo.out.css')
    const restrictTo = [
      'nth-child',
      ':hover',
      'active',
    ]
    await run(input, expectedOut, { allCombinations: true, restrictTo })
  })

  it('should ignore excluded pseudo-classes', async () => {
    const expectedOut = read('./fixtures/exclude.out.css')
    const exclude = [
      ':before', 
      ':after',
      ':active',
    ]
    await run(input, expectedOut, { allCombinations: true, exclude })
  })

  it('should append a custom prefix', async () => {
    const expectedOut = read('./fixtures/prefix.out.css',
    )
    await run(input, expectedOut, { prefix: 'pseudo-class-' })
  })

  it('should wrap pseudo-class in :global() if isModule', async () => {
    const expectedOut = read('./fixtures/isModule.out.css')
    await run(input, expectedOut, { isModule: true })
  })

  it('should generate pseudo classes for before and after', async () => {
    const expectedOut = read('./fixtures/before-after.out.css')
    await run(input, expectedOut, { exclude: null })
  })

})