// Physical 12-seat rows split into three blocks, as in the approved design.
export function getRoomLayout(showtimeId) {
 const variant=((Number(showtimeId.split('-')[1])||1)-1)%3;
 const cells=[];const rowLabels=[];
 const rows=[0,1,2,3,5,6,8];
 ['A','B','C','D','E','F','G'].forEach((label,index)=>{
  const row=rows[index];rowLabels.push({label,row});
  for(let n=1;n<=12;n++){
   const column=n-1+(n>4?2:0)+(n>8?2:0);
   if(label==='G'){
    if(n%2===0)continue;
    cells.push({kind:'seat',row,column,columnSpan:2,seatIds:[`G${n}`,`G${n+1}`]});
   }else cells.push({kind:'seat',row,column,seatIds:[`${label}${n}`]});
  }
 });
 cells.push({kind:'aisle',row:0,column:4,columnSpan:2,rowSpan:9},{kind:'aisle',row:0,column:10,columnSpan:2,rowSpan:9});
 cells.push({kind:'exit',row:9,column:0,columnSpan:3,label:'Lối vào'},{kind:'exit',row:9,column:13,columnSpan:3,label:'Lối ra'});
 return {id:`room-layout-${variant+1}`,columns:16,rows:10,rowLabels,cells};
}
