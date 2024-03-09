const { sortPages } = require('./report.js')
const {test, expect} = require('@jest/globals')

test('sortPages', ()=>{
    const input = {
        'https://https://wagslane.dev/path': 1,
        'https://https://wagslane.dev': 3
    }
    const actual = sortPages(input)
    const expected = [
        ['https://https://wagslane.dev', 3],
        ['https://https://wagslane.dev/path', 1]
    ]
    expect(actual).toEqual(expected)
})