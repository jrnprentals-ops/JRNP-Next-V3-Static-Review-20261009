'use strict';
(function attachQuoteContract(target){
  const propertyMap=Object.freeze({family:'1',ensuite:'2',pool:'5',studio:'4',lake:'3'});
  const limits=Object.freeze({family:8,ensuite:6,pool:2,studio:2,lake:6});
  const datePattern=/^\d{4}-\d{2}-\d{2}$/;
  const validDate=value=>datePattern.test(value)&&!Number.isNaN(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;
  const money=value=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(value);
  function buildRequest(details){
    const key=String(details?.propertyKey||'');
    if(!Object.hasOwn(propertyMap,key))throw new Error('Unknown property. Choose a home again.');
    const checkIn=String(details.checkIn||''),checkOut=String(details.checkOut||''),guests=Number(details.guests);
    if(!validDate(checkIn)||!validDate(checkOut)||checkOut<=checkIn)throw new Error('Choose valid arrival and checkout dates.');
    if(!Number.isInteger(guests)||guests<1||guests>limits[key])throw new Error('Enter an allowed number of guests for this home.');
    return {propertyId:propertyMap[key],checkIn,checkOut,guests,revalidate:true};
  }
  function parseQuote(data,request){
    if(!data||data.available!==true||!data.totals||data.totals.available!==true)throw new Error('Those dates cannot be confirmed as available.');
    if(String(data.property?.id||'')!==request.propertyId||data.checkIn!==request.checkIn||data.checkOut!==request.checkOut||Number(data.guests)!==request.guests)throw new Error('Quote details did not match the requested stay.');
    const t=data.totals,fields=['total','subtotal','cleaningFee','taxes','depositDue','balanceDue'];
    if(fields.some(key=>!(typeof t[key]==='number'||typeof t[key]==='string'&&t[key].trim()!=='')||!Number.isFinite(Number(t[key]))))throw new Error('The estimate could not be verified.');
    const n=Object.fromEntries(fields.map(key=>[key,Number(t[key])]));
    if(fields.some(key=>!Number.isFinite(n[key])||n[key]<0)||n.total<=0||Math.abs(n.subtotal+n.cleaningFee+n.taxes-n.total)>0.02)throw new Error('The estimate could not be verified.');
    if(Math.abs(n.depositDue+n.balanceDue-n.total)>0.02)throw new Error('The payment schedule could not be verified.');
    if(!Number.isInteger(Number(t.nights))||Number(t.nights)<1||t.minStayViolation===true)throw new Error('Minimum-stay requirements could not be verified.');
    return {propertyName:String(data.property.name||'JRNP Rental'),nights:Number(t.nights),...n};
  }
  const maxGuestsFor=propertyKey=>limits[String(propertyKey||'')]??null;
  const api={buildRequest,parseQuote,money,maxGuestsFor};
  target.JRNPQuoteContract=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
