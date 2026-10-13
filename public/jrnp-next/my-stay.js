'use strict';
(()=>{
  const byId=id=>document.getElementById(id);
  const lookupForm=byId('lookupForm');
  const profileForm=byId('profileForm');
  if(!lookupForm||!profileForm)return;

  const session={bookingId:'',guestSession:''};
  let wifiObjectUrl='';
  let lookupPending=false;
  let profilePending=false;

  const clean=value=>String(value||'').replace(/_/g,' ').replace(/\b\w/g,letter=>letter.toUpperCase());
  const setStatus=(element,message,state='')=>{
    element.textContent=message;
    element.classList.toggle('is-error',state==='error');
    element.classList.toggle('is-success',state==='success');
  };
  const responseBody=async response=>{
    const type=String(response.headers.get('content-type')||'');
    if(type.includes('application/json'))return response.json().catch(()=>({}));
    await response.text().catch(()=>'');
    return {};
  };
  const api=async(path,body)=>{
    const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(body)});
    const data=await responseBody(response);
    if(!response.ok){
      const fallback=response.status===429?'Too many attempts. Please wait and try again.':response.status===503?'My Stay is temporarily unavailable. Please contact JRNP guest support if you need immediate help.':'We could not verify those reservation details.';
      const error=new Error(String(data.error||fallback));error.status=response.status;throw error;
    }
    return data;
  };
  const releaseWifiUrl=()=>{if(wifiObjectUrl){URL.revokeObjectURL(wifiObjectUrl);wifiObjectUrl=''}};
  const loadWifi=async()=>{
    releaseWifiUrl();
    byId('wifiCard').hidden=true;
    try{
      const response=await fetch('/api/guest/reservation/wifi-qr',{method:'POST',headers:{'Content-Type':'application/json','Accept':'image/png'},body:JSON.stringify(session)});
      if(!response.ok)return;
      const blob=await response.blob();
      if(!blob.type.startsWith('image/'))return;
      wifiObjectUrl=URL.createObjectURL(blob);
      byId('wifiQr').src=wifiObjectUrl;
      byId('wifiCard').hidden=false;
    }catch(_error){byId('wifiCard').hidden=true}
  };
  const showReservation=reservation=>{
    const stay=reservation||{};
    byId('propertyName').textContent=String(stay.propertyName||'Your JRNP stay');
    byId('dates').textContent=stay.checkIn&&stay.checkOut?String(stay.checkIn)+' – '+String(stay.checkOut):'Contact JRNP for dates';
    const guests=Number(stay.guests||0);
    byId('guestCount').textContent=guests?guests+' guest'+(guests===1?'':'s'):'Contact JRNP';
    byId('bookingStatus').textContent=clean(stay.status)||'On file';
    byId('paymentStatus').textContent=clean(stay.paymentStatus)||'Not provided';
    profileForm.elements.arrivalTime.value=String(stay.arrivalTime||'');
    profileForm.elements.preferredContact.value=['email','text','phone'].includes(String(stay.preferredContact||''))?String(stay.preferredContact):'';
    profileForm.elements.travelNotes.value=String(stay.travelNotes||'');
    byId('cancellationSupportLink').href='/jrnp-next/contact.html?topic='+encodeURIComponent('Existing reservation')+'&booking='+encodeURIComponent(session.bookingId);
    byId('lookup').hidden=true;
    byId('reservation').hidden=false;
    byId('reservation').focus();
    loadWifi();
  };
  const resetPortal=()=>{
    session.bookingId='';session.guestSession='';releaseWifiUrl();
    byId('wifiCard').hidden=true;byId('reservation').hidden=true;byId('lookup').hidden=false;
    byId('otpField').hidden=true;lookupForm.elements.otpCode.required=false;lookupForm.elements.otpCode.value='';
    byId('lookupButton').textContent='Send verification code ↗';
    setStatus(byId('lookupStatus'),'Codes expire quickly and can be used only once.');
    lookupForm.elements.bookingId.focus();
  };

  const presetBooking=new URLSearchParams(window.location.search).get('booking');
  if(presetBooking)lookupForm.elements.bookingId.value=presetBooking.slice(0,100);

  lookupForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(lookupPending||!lookupForm.reportValidity())return;
    const button=byId('lookupButton');
    const bookingId=String(lookupForm.elements.bookingId.value||'').trim();
    const email=String(lookupForm.elements.email.value||'').trim().toLowerCase();
    const code=String(lookupForm.elements.otpCode.value||'').replace(/\D/g,'').slice(-6);
    lookupPending=true;button.disabled=true;button.setAttribute('aria-busy','true');
    try{
      if(!code){
        button.textContent='Sending securely…';setStatus(byId('lookupStatus'),'Requesting a secure verification code…');
        const data=await api('/api/guest/auth/request-code',{bookingId,email});
        byId('otpField').hidden=false;lookupForm.elements.otpCode.required=true;button.textContent='Verify & open My Stay ↗';
        setStatus(byId('lookupStatus'),String(data.message||'If those details match, a verification code has been sent.'),'success');
        lookupForm.elements.otpCode.focus();
        return;
      }
      if(!/^\d{6}$/.test(code)){setStatus(byId('lookupStatus'),'Enter the six-digit code from your verification email.','error');lookupForm.elements.otpCode.focus();return}
      button.textContent='Verifying…';setStatus(byId('lookupStatus'),'Verifying your reservation…');
      const verified=await api('/api/guest/auth/verify-code',{bookingId,email,code});
      if(!verified.guestSession)throw new Error('Verification failed. Request a fresh code and try again.');
      session.bookingId=bookingId;session.guestSession=String(verified.guestSession);
      const result=await api('/api/guest/reservation',session);
      if(!result.reservation)throw new Error('Reservation details are temporarily unavailable.');
      showReservation(result.reservation);
    }catch(error){
      session.bookingId='';session.guestSession='';
      setStatus(byId('lookupStatus'),error.message||'My Stay could not be opened.','error');
      button.textContent=byId('otpField').hidden?'Send verification code ↗':'Verify & open My Stay ↗';
      if(!byId('otpField').hidden){lookupForm.elements.otpCode.value='';lookupForm.elements.otpCode.focus()}
    }finally{lookupPending=false;button.disabled=false;button.removeAttribute('aria-busy')}
  });

  profileForm.addEventListener('submit',async event=>{
    event.preventDefault();
    if(profilePending||!session.guestSession||!profileForm.reportValidity())return;
    const button=byId('profileButton');profilePending=true;button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Saving securely…';
    setStatus(byId('profileStatus'),'Saving your stay details…');
    try{
      await api('/api/guest/reservation/profile',{...session,...Object.fromEntries(new FormData(profileForm))});
      setStatus(byId('profileStatus'),'Your stay details were saved.','success');button.textContent='Details saved ✓';
    }catch(error){setStatus(byId('profileStatus'),error.message||'Your stay details could not be saved.','error');button.textContent='Retry save ↗'}
    finally{profilePending=false;button.disabled=false;button.removeAttribute('aria-busy')}
  });

  byId('changeReservation').addEventListener('click',resetPortal);
  window.addEventListener('pagehide',releaseWifiUrl,{once:true});
})();
