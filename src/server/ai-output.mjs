function formatFailure(code='INVALID_AI_RESPONSE'){
 const error=Error('模型返回的内容暂时无法读取，请重试');error.code=code;return error;
}
export function readModelResult(text,kind){
 const raw=String(text||'').trim();if(!raw)throw formatFailure('EMPTY_RESPONSE');
 const fenced=raw.match(/^```(?:json)?\s*\n?([\s\S]*?)\s*```$/i);
 const value=fenced?fenced[1].trim():raw;
 if(kind==='question'){
  // Questions are prose, not a structured-data extraction task. Keep Markdown,
  // quotes and punctuation exactly as produced; accept legacy answer envelopes.
  if(value.startsWith('{')){
   let result;try{result=JSON.parse(value)}catch{if(/^\{\s*"answer"\s*:/.test(value))throw formatFailure();return {answer:raw}}
   if(result&&Object.hasOwn(result,'answer')){if(typeof result.answer!=='string'||!result.answer.trim())throw formatFailure();return {answer:result.answer}}
   return {answer:raw};
  }
  return {answer:raw};
 }
 let result;try{result=JSON.parse(value)}catch{throw formatFailure()}
 if(!result||typeof result!=='object'||Array.isArray(result))throw formatFailure();
 return result;
}
