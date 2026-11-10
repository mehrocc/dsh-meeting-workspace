import {markdown} from './model.mjs';
import {storedZip} from './bulk-meetings.mjs';

const WORD_MIME='application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const WORD_NS='http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const REL_NS='http://schemas.openxmlformats.org/package/2006/relationships';
const OFFICE_REL='http://schemas.openxmlformats.org/officeDocument/2006/relationships/';
const XML='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const encoder=new TextEncoder();

function plain(text){
 return text.replace(/\*\*([^*]+)\*\*/g,'$1').replace(/`([^`]+)`/g,'$1');
}
function xmlText(text){
 return text.replace(/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/gu,'')
  .replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}
function readLines(markdownText){
 return markdownText.split(/\r?\n/).filter(line=>line.trim()).map(line=>{
  const heading=line.match(/^(#{1,6})\s+(.+)$/);
  if(heading)return {style:heading[1].length===1?'Title':heading[1].length===2?'Heading1':'Heading2',text:plain(heading[2])};
  const list=line.match(/^\s*[-*]\s+(.*)$/);
  if(list)return {style:'ListParagraph',text:'• '+plain(list[1].replace(/^\[x\]\s/i,'［已完成］').replace(/^\[ \]\s/,'［待跟进］'))};
  return {style:'Normal',text:plain(line)};
 });
}
function stylesXml(){
 const font='<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="PingFang SC"/>';
 const style=(id,name,size,pPr,bold=false)=>`<w:style w:type="paragraph" w:styleId="${id}"${id==='Normal'?' w:default="1"':''}><w:name w:val="${name}"/>${id==='Normal'?'':'<w:basedOn w:val="Normal"/>'}<w:pPr>${pPr}</w:pPr><w:rPr>${font}${bold?'<w:b/>':''}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr></w:style>`;
 return XML+`<w:styles xmlns:w="${WORD_NS}">`+
  style('Normal','Normal',22,'<w:spacing w:after="125" w:line="300" w:lineRule="auto"/>')+
  style('Title','Title',42,'<w:keepNext/><w:spacing w:after="180"/>',true)+
  style('Heading1','heading 1',28,'<w:keepNext/><w:spacing w:before="280" w:after="120"/><w:outlineLvl w:val="0"/>',true)+
  style('Heading2','heading 2',24,'<w:keepNext/><w:spacing w:before="160" w:after="90"/><w:outlineLvl w:val="1"/>',true)+
  style('ListParagraph','List Paragraph',22,'<w:spacing w:after="90"/><w:ind w:left="270" w:hanging="180"/>')+'</w:styles>';
}
function docx(lines){
 const paragraphs=lines.map(({style,text})=>`<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r><w:t xml:space="preserve">${xmlText(text)}</w:t></w:r></w:p>`).join('');
 const entries={
  '[Content_Types].xml':XML+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
  '_rels/.rels':XML+`<Relationships xmlns="${REL_NS}"><Relationship Id="rId1" Type="${OFFICE_REL}officeDocument" Target="word/document.xml"/></Relationships>`,
  'word/_rels/document.xml.rels':XML+`<Relationships xmlns="${REL_NS}"><Relationship Id="rId1" Type="${OFFICE_REL}styles" Target="styles.xml"/></Relationships>`,
  'word/styles.xml':stylesXml(),
  'word/document.xml':XML+`<w:document xmlns:w="${WORD_NS}"><w:body>${paragraphs}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1230" w:right="1320" w:bottom="1230" w:left="1320" w:header="500" w:footer="500" w:gutter="0"/></w:sectPr></w:body></w:document>`
 };
 return storedZip(Object.entries(entries).map(([path,text])=>({path,content:encoder.encode(text)})));
}
export function minutesFile(meeting,project,format){
 const name=meeting.title.replace(/[\\/:*?"<>|\x00-\x1f\x7f]/g,'-').replace(/^\.+/,'').trim().slice(0,100)||'会议纪要';
 const source=markdown(meeting,project);
 if(format==='md')return {name:name+'.md',type:'text/markdown;charset=utf-8',content:source};
 const lines=readLines(source);
 if(format==='docx')return {name:name+'.docx',type:WORD_MIME,content:docx(lines)};
 if(format==='txt'){
  const text=lines.map(({style,text},i)=>i>0&&(style==='Heading1'||style==='Heading2')?'\r\n'+text:text).join('\r\n');
  return {name:name+'.txt',type:'text/plain;charset=utf-8',content:'\ufeff'+text+'\r\n'};
 }
 throw Error('不支持的纪要格式');
}
