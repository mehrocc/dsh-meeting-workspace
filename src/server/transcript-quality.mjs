// These checks reject known unusable output. Passing them is not an accuracy score.
export function checkedTranscript(value) {
  if (typeof value !== 'string') throw Error('语音模型没有返回文字，原录音已保留');
  const text = value.trim();
  if (!text || /^(?:\[BLANK_AUDIO\]|\[无音频\])$/i.test(text)) return '';
  const labels = /(?:\([^()]*\)|（[^（）]*）|\[[^\[\]]*\]|【[^【】]*】)/g;
  if (!text.replace(labels, '').trim()) {
    throw Error('模型仅返回声音描述，未识别出可靠逐字稿；原录音已保留，请核对音源或更换识别模型');
  }
  return text;
}
