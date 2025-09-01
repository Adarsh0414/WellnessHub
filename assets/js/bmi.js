(function(){
  const form = document.getElementById('bmi-form');
  const output = document.getElementById('bmi-output');
  const feedback = document.getElementById('form-feedback');
  const lastPanel = document.getElementById('last-result');
  const lastBody = document.getElementById('last-result-body');

  function mifflinStJeor(sex, weightKg, heightCm, age){
    // BMR
    const s = sex === 'male' ? 5 : -161;
    return 10*weightKg + 6.25*heightCm - 5*age + s;
  }

  function calorieRange(bmiCat, tdee){
    // crude guidance: maintain around TDEE; loss: 10-20% deficit; gain: 5-15% surplus
    if(bmiCat === 'Underweight'){
      return {
        goal: 'Gradual weight gain',
        from: Math.round(tdee*1.05),
        to: Math.round(tdee*1.15)
      };
    }
    if(bmiCat === 'Normal'){
      return {
        goal: 'Weight maintenance',
        from: Math.round(tdee*0.95),
        to: Math.round(tdee*1.05)
      };
    }
    if(bmiCat === 'Overweight'){
      return {
        goal: 'Slow weight loss',
        from: Math.round(tdee*0.8),
        to: Math.round(tdee*0.9)
      };
    }
    return {
      goal: 'Weight loss',
      from: Math.round(tdee*0.75),
      to: Math.round(tdee*0.85)
    };
  }

  function waistRisk(sex, waist){
    if(!waist) return null;
    if(sex==='male'){
      if(waist >= 102) return 'High cardiometabolic risk (male, waist ≥ 102 cm).';
      if(waist >= 94) return 'Elevated risk (male, waist ≥ 94 cm).';
      return 'Waist circumference within lower risk range for males.';
    } else {
      if(waist >= 88) return 'High cardiometabolic risk (female, waist ≥ 88 cm).';
      if(waist >= 80) return 'Elevated risk (female, waist ≥ 80 cm).';
      return 'Waist circumference within lower risk range for females.';
    }
  }

  function advice(bmiCat){
    switch(bmiCat){
      case 'Underweight':
        return [
          'Prioritize calorie-dense, nutrient-rich foods (nuts, seeds, dairy, legumes).',
          'Increase meal frequency and consider smoothies/shakes for extra calories.',
          'Incorporate resistance training to support lean mass gains.',
        ];
      case 'Normal':
        return [
          'Maintain balanced plate: half vegetables, quarter protein, quarter whole grains.',
          'Keep up regular activity: 150+ minutes/week moderate intensity.',
          'Focus on sleep consistency and stress management to support health.',
        ];
      case 'Overweight':
        return [
          'Aim for a modest calorie deficit with plenty of protein and fiber.',
          'Increase non-exercise movement (steps, standing breaks).',
          'Strength train 2–3x/week to preserve muscle while losing fat.',
        ];
      default:
        return [
          'Adopt sustainable changes: reduce ultra-processed foods and sugary drinks.',
          'Combine a calorie deficit with adequate protein intake.',
          'Seek guidance from a qualified professional if possible.',
        ];
    }
  }

  function saveResult(data){
    localStorage.setItem('wellness:lastBMI', JSON.stringify({ ...data, savedAt: new Date().toISOString() }));
  }
  function loadResult(){
    try{
      const raw = localStorage.getItem('wellness:lastBMI');
      if(!raw) return null;
      return JSON.parse(raw);
    }catch(e){return null}
  }

  function renderLast(){
    const last = loadResult();
    if(!last){ lastPanel.style.display='none'; return; }
    lastPanel.style.display='block';
    lastBody.innerHTML = `
      <div><strong>${last.bmi}</strong> BMI — ${last.category}</div>
      <div class="muted">Saved ${new Date(last.savedAt).toLocaleString()}</div>
      <div>${last.calorie.goal}: ${last.calorie.from} – ${last.calorie.to} kcal/day</div>
    `;
  }

  function handleSubmit(e){
    e.preventDefault();
    feedback.textContent='';

    const age = +form.age.value;
    const sex = form.sex.value;
    const height = +form.height.value;
    const weight = +form.weight.value;
    const activity = +form.activity.value;
    const waist = form.waist.value ? +form.waist.value : null;

    if(!age || !sex || !height || !weight || !activity){
      feedback.textContent = 'Please fill all required fields.';
      feedback.style.color = '#fca5a5';
      return;
    }

    const bmiVal = window.Wellness.bmi(weight, height);
    const cat = window.Wellness.bmiCategory(bmiVal);

    const bmr = mifflinStJeor(sex, weight, height, age);
    const tdee = bmr * activity;
    const cal = calorieRange(cat, tdee);

    const waistMsg = waistRisk(sex, waist);
    const adv = advice(cat);

    output.style.display='block';
    output.innerHTML = `
      <h3>Your Results</h3>
      <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:center">
        <div class="panel" style="padding:10px 14px"><strong>${bmiVal}</strong> BMI — ${cat}</div>
        <div class="panel" style="padding:10px 14px">Estimated TDEE: <strong>${Math.round(tdee)}</strong> kcal/day</div>
        <div class="panel" style="padding:10px 14px">${cal.goal}: <strong>${cal.from} – ${cal.to}</strong> kcal/day</div>
      </div>
      ${waistMsg ? `<p style="margin-top:10px">${waistMsg}</p>` : ''}
      <h4 style="margin:12px 0 6px">Advice</h4>
      <ul>${adv.map(a=>`<li>${a}</li>`).join('')}</ul>
      <p class="muted">This tool provides educational information and is not a medical diagnosis.</p>
    `;

    // Save temporary current result object for the Save button
    form._current = { bmi: bmiVal, category: cat, calorie: cal };
  }

  function handleReset(){
    form.reset();
    output.style.display='none';
    feedback.textContent='';
  }

  function handleSave(){
    if(!form._current){
      feedback.textContent = 'Calculate a result first.';
      feedback.style.color = '#fca5a5';
      return;
    }
    saveResult(form._current);
    feedback.textContent = 'Result saved locally.';
    feedback.style.color = '#a7f3d0';
    renderLast();
  }

  if(form){
    form.addEventListener('submit', handleSubmit);
    document.getElementById('reset').addEventListener('click', handleReset);
    document.getElementById('save').addEventListener('click', handleSave);
    renderLast();
  }
})();
