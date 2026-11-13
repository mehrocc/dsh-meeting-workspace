// Per-meeting voice prototypes. No identities are shared between meetings.
function normalized(value){const norm=Math.hypot(...value);return norm>0&&Number.isFinite(norm)?Array.from(value,x=>x/norm):null}
class SpeakerRegistry{
 constructor(){this.profiles=[]}
 match(value){
  const vector=normalized(value);if(!vector)return -1;
  const ranked=this.profiles.map((p,id)=>({id,score:p.vector.reduce((sum,x,i)=>sum+x*(vector[i]||0),0)})).sort((a,b)=>b.score-a.score);
  const best=ranked[0];
  if(best&&best.score>=.68&&(!ranked[1]||best.score-ranked[1].score>=.08)){
   const p=this.profiles[best.id];p.vector=normalized(p.vector.map((x,i)=>x*.9+vector[i]*.1));return best.id;
  }
  if((!best||best.score<.52)&&this.profiles.length<32){this.profiles.push({vector});return this.profiles.length-1}
  return -1; // Ambiguous evidence stays unknown instead of inventing another person.
 }
}
module.exports={SpeakerRegistry};
