// 引擎逻辑自测（node --experimental-strip-types）
import { nimSum, toBinary, isWinningPosition } from './src/engine/xorCalculator.ts'
import { findOptimalMove, decideAIMove } from './src/engine/nimAI.ts'
import { applyMove, isLegalMove } from './src/engine/nimRules.ts'

let failures = 0
function check(name: string, cond: boolean) {
  if (!cond) {
    failures++
    console.log(`FAIL: ${name}`)
  } else {
    console.log(`ok: ${name}`)
  }
}

// XOR 基础
check('5^3 = 6', nimSum([5, 3]) === 6)
check('7^5 = 2', nimSum([7, 5]) === 2)
check('toBinary 5 = 101', toBinary(5) === '101')
check('toBinary 7 pad 3 = 111', toBinary(7, 3) === '111')
check('winning pos [7,5]', isWinningPosition([7, 5]) === true)
check('zero pos [7,7]', isWinningPosition([7, 7]) === false)

// 必胜操作
const m = findOptimalMove([7, 5])
check('optimal move [7,5]', m !== null && m.pileIndex === 0 && m.remove === 2)
const m2 = findOptimalMove([4, 5, 3])
check('optimal move [4,5,3]', m2 !== null && applyMove([4, 5, 3], m2.pileIndex, m2.remove).reduce((a, b) => a ^ b, 0) === 0)
check('no move on zero [3,3]', findOptimalMove([3, 3]) === null)

// 随机局面下困难 AI 必须产生合法且（若可）归零的操作
let aiOk = 0
let aiZero = 0
for (let i = 0; i < 2000; i++) {
  const piles = Array.from({ length: 3 + Math.floor(Math.random() * 3) }, () => 1 + Math.floor(Math.random() * 15))
  const mv = decideAIMove(piles, 'hard')
  const legal = isLegalMove(piles, mv.pileIndex, mv.remove)
  if (!legal) break
  aiOk++
  const after = applyMove(piles, mv.pileIndex, mv.remove)
  if (after.reduce((a, b) => a ^ b, 0) === 0) aiZero++
  // 若存在必胜操作，AI 必须制造 XOR=0
  if (findOptimalMove(piles) !== null && nimSum(after) !== 0) {
    failures++
    console.log(`FAIL: hard AI 未归零: [${piles}]`)
    break
  }
}
check('hard AI 2000 局全部合法', aiOk === 2000)
check('hard AI 必胜局面必归零', aiZero > 0)

// 边界：单堆
const single = findOptimalMove([9])
check('single pile [9] -> remove all', single !== null && single.remove === 9)

// 全零局面无操作
check('legal moves on [0,0] none', isLegalMove([0, 0], 0, 1) === false)

console.log(failures === 0 ? 'ALL PASS' : `${failures} FAILURES`)
process.exit(failures === 0 ? 0 : 1)
