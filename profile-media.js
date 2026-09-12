export function validateImage(file) {
  if(!file || !['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('JPG, PNG, WebP 사진을 선택해 주세요.');
  if(file.size>10*1024*1024)throw new Error('10MB 이하의 사진을 선택해 주세요.');
  if(!file.size)throw new Error('빈 파일은 사진으로 사용할 수 없어요.');
}
export async function preparePhoto(file) {
  validateImage(file);
  const url=URL.createObjectURL(file);
  try {
    const img=await new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('사진을 읽지 못했어요. 다른 사진을 선택해 주세요.'));image.src=url;});
    if(!img.naturalWidth||!img.naturalHeight)throw new Error('사진 크기를 확인하지 못했어요.');
    const canvas=document.createElement('canvas');canvas.width=640;canvas.height=640;
    const context=canvas.getContext('2d');if(!context)throw new Error('이 브라우저에서 사진을 처리하지 못했어요.');
    const side=Math.min(img.naturalWidth,img.naturalHeight);
    context.drawImage(img,(img.naturalWidth-side)/2,(img.naturalHeight-side)/2,side,side,0,0,640,640);
    return canvas.toDataURL('image/webp',.86);
  } finally { URL.revokeObjectURL(url); }
}
