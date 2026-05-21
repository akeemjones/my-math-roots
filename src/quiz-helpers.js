// ════════════════════════════════════════
//  QUIZ HELPERS — pure, Node-loadable
//
//  Tiny module that mirrors the unit-quiz sampler's idea of "how many
//  questions does a Unit Quiz attempt actually contain?" so the banner in
//  unit.js can display the same number the student will see when they start.
//
//  Single source of truth for the three grade paths:
//
//    K  → u.quizBlueprint  (sum)        — _buildKUnitQuiz() in shared_k.js
//    G1 → u.unitTest.totalQuestions     — _sampleUnitTestAttempt() in quiz.js
//    G2 → default 25                    — _runQuiz()'s `n` for type==='unit'
//
//  Pure function, no DOM / no globals — safe to require() from Jest.
// ════════════════════════════════════════

function _unitQuizSize(u){
  if (!u) return 25;
  if (u.quizBlueprint){
    var bp = u.quizBlueprint;
    var sum = 0;
    for (var k in bp){
      if (Object.prototype.hasOwnProperty.call(bp, k)) sum += (bp[k] || 0);
    }
    if (sum > 0) return sum;
  }
  if (u.unitTest && typeof u.unitTest.totalQuestions === 'number' && u.unitTest.totalQuestions > 0){
    return u.unitTest.totalQuestions;
  }
  return 25;
}

if (typeof module !== 'undefined' && module.exports){
  module.exports = { _unitQuizSize };
}
