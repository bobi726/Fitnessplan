// Fitnessplan JavaScript
// Hier kannst du deine JavaScript-Funktionen hinzufügen

document.addEventListener('DOMContentLoaded', function() {
  console.log('Fitnessplan App geladen');
  
  // Beispiel: Event Listener für Buttons
  const buttons = document.querySelectorAll('button');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      console.log('Button geklickt:', this.textContent);
    });
  });
});

// Beispiel-Funktionen für dein Fitnessprogramm
function addExercise(name, sets, reps) {
  console.log(`Übung hinzugefügt: ${name} - ${sets}x${reps}`);
}

function calculateCalories(duration, intensity) {
  // Einfache Kalorienschätzung
  const caloriesPerMinute = intensity === 'high' ? 15 : intensity === 'medium' ? 10 : 5;
  return duration * caloriesPerMinute;
}

function updateProgress(day, completed) {
  console.log(`Tag ${day}: ${completed ? 'Abgeschlossen' : 'Nicht abgeschlossen'}`);
}
