export async function readAPIResponse(response){
 const text=await response.text();let value;
 try{value=JSON.parse(text);if(value===null||typeof value!=='object')throw Error('invalid response shape')}catch{
  const unavailable=[502,503,504].includes(response.status)||/^Harness (?:proxy failed|unavailable)/.test(text);
  const error=Error(unavailable?'DSH 本机服务连接未完成，请稍后重试。':'本机服务返回的内容无法读取，请重试。');
  error.status=response.status;error.code=unavailable?'HARNESS_UNAVAILABLE':'INVALID_SERVICE_RESPONSE';throw error;
 }
 return value;
}
