const replaceCopy=(root)=>{
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()) nodes.push(walker.currentNode);
  for(const node of nodes){
    if(node.nodeValue?.includes('MEETRUST')) node.nodeValue=node.nodeValue.replaceAll('MEETRUST','전북 이음');
    if(node.nodeValue?.includes('meetrust')) node.nodeValue=node.nodeValue.replaceAll('meetrust','전북 이음');
    const oldIeum='\uC787\uC74C';
    if(node.nodeValue?.includes(oldIeum)) node.nodeValue=node.nodeValue.replaceAll(oldIeum,'이음');
  }
};

const root=document.body;
if(root){
  replaceCopy(root);
  new MutationObserver(()=>replaceCopy(root)).observe(root,{childList:true,subtree:true,characterData:true});
}
