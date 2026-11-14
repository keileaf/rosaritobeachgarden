(() => {
  const endpoint = window.RBG_CONFIG?.sheetsEndpoint?.trim() || '';
  const enabled = window.RBG_CONFIG?.sheetsEnabled === true && /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(endpoint);
  const form = document.querySelector('#inquiry'), date = document.querySelector('#date');
  const submit = form.querySelector('[type="submit"]');
  const status = document.querySelector('#form-status');
  const region = document.createElement('section');
  region.className = 'availability';
  region.innerHTML = '<h3></h3><p class="availability-note"></p><div class="calendar-heading"><button type="button" class="month-prev">‹</button><strong></strong><button type="button" class="month-next">›</button></div><div class="calendar-week"></div><div class="calendar-days"></div><p class="calendar-status" role="status"></p><button type="button" class="text-link availability-refresh"></button>';
  form.before(region);
  // Keep the calendar beside the form as a single contact column.
  const column = document.createElement('div');
  column.className = 'booking-column';
  form.before(column); column.append(region, form);
  const emailLabel = document.createElement('label'); emailLabel.htmlFor = 'reply-email';
  const email = document.createElement('input');
  email.id = 'reply-email'; email.name = 'email'; email.type = 'email'; email.autocomplete = 'email'; email.maxLength = 254; email.required = enabled;
  document.querySelector('.form-row').before(emailLabel, email);
  const honey = document.createElement('input'); honey.name = 'website'; honey.tabIndex = -1; honey.autocomplete = 'off'; honey.className = 'form-trap'; honey.setAttribute('aria-hidden', 'true'); form.append(honey);
  let month = new Date(); month = new Date(month.getFullYear(), month.getMonth(), 1);
  const minimumMonth = new Date(month), maximumMonth = new Date(month.getFullYear(), month.getMonth() + 17, 1);
  let blocked = new Set(), loaded = false, loading = false, failed = false, busy = false, requestId = null, lastPayload = null;
  const en = () => document.documentElement.lang === 'en';
  const t = (es, english) => en() ? english : es;
  const iso = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  function dateValidity() {
    date.setCustomValidity(loaded && blocked.has(date.value) ? t('Esta fecha está apartada. Elige otra fecha.', 'This date is reserved. Please choose another date.') : '');
  }
  function draw() {
    region.querySelector('h3').textContent = t('Encuentra tu fecha', 'Find your date');
    region.querySelector('.availability-note').hidden = !enabled;
    region.querySelector('.availability-note').textContent = t('Las fechas apartadas no se pueden seleccionar. Las demás están sujetas a confirmación del equipo.', 'Reserved dates cannot be selected. Other dates are subject to confirmation by the team.');
    emailLabel.textContent = enabled ? t('Correo de contacto', 'Contact email') : t('Correo de contacto (opcional)', 'Contact email (optional)');
    region.querySelector('.calendar-heading strong').textContent = new Intl.DateTimeFormat(en()?'en-US':'es-MX',{month:'long',year:'numeric'}).format(month);
    const prev = region.querySelector('.month-prev'), next = region.querySelector('.month-next');
    prev.setAttribute('aria-label',t('Mes anterior','Previous month')); next.setAttribute('aria-label',t('Mes siguiente','Next month'));
    prev.disabled = month <= minimumMonth; next.disabled = month >= maximumMonth;
    region.querySelector('.calendar-week').replaceChildren();
    (en()?['Mon','Tue','Wed','Thu','Fri','Sat','Sun']:['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']).forEach(day=>{const span=document.createElement('span');span.textContent=day;region.querySelector('.calendar-week').append(span);});
    const days = region.querySelector('.calendar-days');days.replaceChildren();
    for(let i=0;i<(month.getDay()+6)%7;i++) days.append(document.createElement('span'));
    const today = iso(new Date());
    for(let day=1;day<=new Date(month.getFullYear(),month.getMonth()+1,0).getDate();day++) {
      const d=new Date(month.getFullYear(),month.getMonth(),day), value=iso(d), reserved=blocked.has(value), button=document.createElement('button');
      button.type='button'; button.textContent=day;button.disabled=!loaded||reserved||value<today;
      button.classList.toggle('reserved',reserved);button.classList.toggle('selected',date.value===value);button.setAttribute('aria-pressed',String(date.value===value));
      button.setAttribute('aria-label',new Intl.DateTimeFormat(en()?'en-US':'es-MX',{dateStyle:'long'}).format(d)+(reserved?t(', apartada',', reserved'):!loaded?t(', disponibilidad sin verificar',', availability unverified'):t(', consultar',', inquire')));
      button.addEventListener('click',()=>{date.value=value;dateValidity();draw();date.focus();});days.append(button);
    }
    region.querySelector('.calendar-status').textContent = !enabled ? t('Consulta las fechas disponibles por correo o Facebook.', 'Ask about available dates by email or Facebook.') : loading ? t('Consultando calendario…','Loading calendar…') : failed ? t('No pudimos consultar el calendario. Reintenta o consulta al equipo.', 'We could not load the calendar. Retry or contact the team.') : t('Calendario actualizado. Una consulta no aparta la fecha.', 'Calendar updated. An inquiry does not reserve a date.');
    const refresh = region.querySelector('.availability-refresh');refresh.hidden=!enabled;refresh.disabled=loading;refresh.textContent=t('Actualizar fechas','Refresh dates');
    region.querySelector('.calendar-heading').hidden=!enabled;region.querySelector('.calendar-week').hidden=!enabled;days.hidden=!enabled;
    if(enabled){submit.querySelector('span').textContent=busy?t('Registrando…','Submitting…'):t('Enviar solicitud','Send inquiry');form.querySelector('[data-i18n="formNote"]').textContent=t('Tu solicitud se guardará para que el equipo te contacte. No confirma ni aparta una fecha.','Your inquiry will be saved so the team can contact you. It does not confirm or reserve a date.');}
    dateValidity();
  }
  async function refresh() {
    if(!enabled||loading)return;
    loading=true;failed=false;loaded=false;draw();
    try {
      const response=await fetch(`${endpoint}?action=availability&t=${Date.now()}`,{redirect:'follow',signal:AbortSignal.timeout(15000)});
      const result=await response.json();
      if(!response.ok||result.ok!==true||!Array.isArray(result.reserved))throw Error('Invalid response');
      blocked=new Set(result.reserved.filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)));loaded=true;
    } catch { failed=true; } finally {loading=false;draw();}
  }
  region.querySelector('.month-prev').addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()-1,1);draw();});
  region.querySelector('.month-next').addEventListener('click',()=>{month=new Date(month.getFullYear(),month.getMonth()+1,1);draw();});
  region.querySelector('.availability-refresh').addEventListener('click',refresh);
  date.addEventListener('input',()=>{dateValidity();draw();});
  document.addEventListener('rbg:language',draw);
  form.addEventListener('submit',async event=>{
    if(!enabled)return;
    event.preventDefault();event.stopImmediatePropagation();if(busy)return;
    dateValidity();if(!form.reportValidity())return;
    const fields=Object.fromEntries(new FormData(form));
    const signature=JSON.stringify(fields);
    if(signature!==lastPayload){requestId=crypto.randomUUID();lastPayload=signature;}
    busy=true;submit.disabled=true;status.textContent='';draw();
    try {
      const response=await fetch(endpoint,{method:'POST',body:new URLSearchParams({...fields,requestId,language:en()?'en':'es',action:'inquiry'}),redirect:'follow',signal:AbortSignal.timeout(20000)});
      const result=await response.json();
      if(result.code==='DATE_RESERVED'){await refresh();dateValidity();date.reportValidity();throw Error('reserved');}
      if(!response.ok||result.ok!==true)throw Error('unconfirmed');
      status.textContent=t('Solicitud registrada. El equipo confirmará disponibilidad y condiciones por correo.','Inquiry recorded. The team will confirm availability and terms by email.');
      form.reset();requestId=null;lastPayload=null;
    } catch(error) {
      status.textContent=error.message==='reserved'?t('Esta fecha acaba de apartarse. Elige otra.','This date has just been reserved. Choose another.'):t('No pudimos confirmar el registro. Reintenta con los mismos datos o copia la consulta y envíala por correo.','We could not confirm the submission. Retry with the same details, or copy the inquiry and send it by email.');
    } finally {busy=false;submit.disabled=false;draw();}
  },true);
  draw();refresh();
})();
