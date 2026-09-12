const replaceBrand=(root)=>{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  for(const node of nodes){
    if(node.nodeValue?.includes('MEETRUST')) node.nodeValue=node.nodeValue.replaceAll('MEETRUST','전북이음');
    if(node.nodeValue?.includes('meetrust')) node.nodeValue=node.nodeValue.replaceAll('meetrust','전북이음');
  }
};
const modal=document.getElementById('modal');
if(modal){
  replaceBrand(modal);
  new MutationObserver(()=>replaceBrand(modal)).observe(modal,{childList:true,subtree:true,characterData:true});
}
