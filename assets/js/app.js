// Shared utilities and simple UX behaviors
(function(){
  const $ = sel => document.querySelector(sel);

  // Newsletter UX only (no backend)
  const form = document.getElementById('newsletter-form');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const email = form.email.value.trim();
      const fb = document.getElementById('nl-feedback');
      if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
        fb.textContent = 'Please enter a valid email address.';
        fb.style.color = '#fca5a5';
        return;
      }
      fb.textContent = 'Subscribed! Check your inbox for a welcome email.';
      fb.style.color = '#a7f3d0';
      form.reset();
    });
  }

  // Export a minimal helper globally for other pages
  window.Wellness = {
    bmi: function(weightKg, heightCm){
      const h = heightCm/100;
      if(!weightKg || !heightCm || h<=0) return null;
      return +(weightKg / (h*h)).toFixed(1);
    },
    bmiCategory: function(bmi){
      if(bmi==null) return 'Unknown';
      if(bmi < 18.5) return 'Underweight';
      if(bmi < 25) return 'Normal';
      if(bmi < 30) return 'Overweight';
      return 'Obesity';
    }
  };
})();
