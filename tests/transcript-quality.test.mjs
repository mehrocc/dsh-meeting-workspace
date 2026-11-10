import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkedTranscript} from '../src/server/transcript-quality.mjs';

test('non-speech model descriptions cannot become finalized meeting evidence', () => {
  for (const text of ['(试试)', '(咬咬咬咬)\n(咬咬咬咬咬)', '(coughing)\n(coughing)', '[M]', '（音乐） 【噪声】']) {
    assert.throws(() => checkedTranscript(text), /仅返回声音描述/);
  }
});

test('ordinary speech and punctuation are preserved; empty recognition remains empty', () => {
  for (const text of ['我们周一再确认方案。', '请核对（第二版）方案。', 'Alex will review [Project A].', '(笑) 我们继续讨论。']) {
    assert.equal(checkedTranscript(text), text);
  }
  assert.equal(checkedTranscript(' [BLANK_AUDIO] '), '');
  assert.equal(checkedTranscript(''), '');
  assert.throws(() => checkedTranscript(null), /没有返回文字/);
});
