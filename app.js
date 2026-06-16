/**
 * FitnessPlan - Moderne WebApp zur Trainingsplanung
 * @author FitnessPlan Team
 * @version 2.0.0
 */

// ==================== KONFIGURATION ====================

const CONFIG = {
    STORAGE_KEY: 'fitnessPlan_data',
    DARK_MODE_KEY: 'fitnessPlan_darkMode',
    WEEKDAYS: ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'],
    TRAINING_TYPES: {
        running: { label: '🏃 Laufen', icon: '🏃', color: '#ff6b6b' },
        running_easy: { label: '🏃 Locker', icon: '🏃', color: '#ffa07a' },
        running_tempo: { label: '🏃 Tempo', icon: '🏃', color: '#ff4500' },
        running_interval: { label: '🏃 Intervalle', icon: '🏃', color: '#dc143c' },
        strength: { label: '💪 Krafttraining', icon: '💪', color: '#4ecdc4' },
        recovery: { label: '☘️ Regeneration', icon: '☘️', color: '#95e1d3' },
        stretching: { label: '🧘 Dehnen/Mobilität', icon: '🧘', color: '#b19cd9' }
    }
};

// ==================== STORAGE-MANAGER ====================

class StorageManager {
    static save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    static load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage load error:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    static clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
}

// ==================== TRAINING-MANAGER ====================

class TrainingManager {
    constructor() {
        this.trainings = StorageManager.load(CONFIG.STORAGE_KEY, []);
        this.ensureIntegrity();
    }

    ensureIntegrity() {
        // Validiere und bereinige alte Daten
        this.trainings = this.trainings.filter(t => 
            t.id && t.title && typeof t.day === 'number' && 
            t.duration >= 0 && CONFIG.TRAINING_TYPES[t.type]
        );
    }

    addTraining(training) {
        const newTraining = {
            id: `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            createdAt: new Date().toISOString(),
            completed: false,
            notes: '',
            ...training
        };

        // Validierung
        if (!newTraining.title || !newTraining.title.trim()) {
            throw new Error('Titel ist erforderlich');
        }
        if (newTraining.duration < 0 || newTraining.duration > 1440) {
            throw new Error('Dauer muss zwischen 0 und 1440 Minuten liegen');
        }
        if (newTraining.day < 0 || newTraining.day > 6) {
            throw new Error('Ungültiger Tag');
        }
        if (!CONFIG.TRAINING_TYPES[newTraining.type]) {
            throw new Error('Ungültige Trainingsart');
        }

        this.trainings.push(newTraining);
        this.save();
        return newTraining;
    }

    updateTraining(id, updates) {
        const training = this.trainings.find(t => t.id === id);
        if (!training) throw new Error('Training nicht gefunden');

        const updated = { ...training, ...updates, id: training.id };
        const index = this.trainings.indexOf(training);
        this.trainings[index] = updated;
        this.save();
        return updated;
    }

    deleteTraining(id) {
        const index = this.trainings.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Training nicht gefunden');

        this.trainings.splice(index, 1);
        this.save();
    }

    toggleCompletion(id) {
        const training = this.trainings.find(t => t.id === id);
        if (!training) throw new Error('Training nicht gefunden');

        training.completed = !training.completed;
        this.save();
        return training;
    }

    getTrainingsForDay(dayIndex) {
        return this.trainings.filter(t => t.day === dayIndex);
    }

    getTrainingsForWeek(weekOffset = 0) {
        return this.trainings;
    }

    getAllTrainings() {
        return [...this.trainings];
    }

    save() {
        StorageManager.save(CONFIG.STORAGE_KEY, this.trainings);
    }

    export() {
        return {
            version: '2.0.0',
            exportedAt: new Date().toISOString(),
            trainings: this.trainings
        };
    }

    import(data) {
        if (!data.trainings || !Array.isArray(data.trainings)) {
            throw new Error('Ungültiges Export-Format');
        }
        this.trainings = data.trainings;
        this.ensureIntegrity();
        this.save();
    }
}

// ==================== STATISTIK-MANAGER ====================

class StatisticsManager {
    constructor(trainingManager) {
        this.tm = trainingManager;
    }

    getWeekStats(dayIndices) {
        const trainings = dayIndices.length > 0 
            ? this.tm.getAllTrainings().filter(t => dayIndices.includes(t.day))
            : this.tm.getAllTrainings();

        const completed = trainings.filter(t => t.completed).length;
        const total = trainings.length;

        return {
            completed,
            total,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
            trainings
        };
    }

    getDayStats(dayIndex) {
        const trainings = this.tm.getTrainingsForDay(dayIndex);
        const completed = trainings.filter(t => t.completed).length;
        const total = trainings.length;

        return {
            completed,
            total,
            progress: total > 0 ? Math.round((completed / total) * 100) : 0,
            trainings
        };
    }

    getOverallStats() {
        const trainings = this.tm.getAllTrainings();
        const completed = trainings.filter(t => t.completed).length;
        const total = trainings.length;
        const totalDuration = trainings.reduce((sum, t) => sum + t.duration, 0);

        const byType = {};
        Object.keys(CONFIG.TRAINING_TYPES).forEach(type => {
            byType[type] = {
                count: trainings.filter(t => t.type === type).length,
                duration: trainings
                    .filter(t => t.type === type)
                    .reduce((sum, t) => sum + t.duration, 0)
            };
        });

        return {
            total,
            completed,
            pending: total - completed,
            successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            totalDuration,
            avgDuration: total > 0 ? Math.round(totalDuration / total) : 0,
            avgPerDay: Math.round(totalDuration / 7),
            byType,
            trainings
        };
    }

    getStatsForPeriod(startDate, endDate) {
        const trainings = this.tm.getAllTrainings().filter(t => {
            const date = new Date(t.createdAt);
            return date >= startDate && date <= endDate;
        });

        const completed = trainings.filter(t => t.completed).length;
        return {
            period: `${startDate.toLocaleDateString('de-DE')} - ${endDate.toLocaleDateString('de-DE')}`,
            trainings: trainings.length,
            completed,
            successRate: trainings.length > 0 ? Math.round((completed / trainings.length) * 100) : 0
        };
    }
}

// ==================== UI-MANAGER ====================

class UIManager {
    constructor(trainingManager, statisticsManager) {
        this.tm = trainingManager;
        this.sm = statisticsManager;
        this.currentWeekOffset = 0;
        this.currentDayOffset = 0;
        this.editingId = null;
        this.listeners = [];
    }

    // ---- Event Management ----

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    // ---- Date Management ----

    getWeekDates() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
        weekStart.setDate(weekStart.getDate() + this.currentWeekOffset * 7);

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    }

    getWeekTitle() {
        const dates = this.getWeekDates();
        const start = dates[0];
        const end = dates[6];
        return `${start.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}`;
    }

    getCurrentDate() {
        const today = new Date();
        const date = new Date(today);
        date.setDate(today.getDate() + this.currentDayOffset);
        return date;
    }

    getCurrentDayIndex() {
        const today = new Date();
        let dayIndex = today.getDay() - 1;
        if (dayIndex === -1) dayIndex = 6;
        return ((dayIndex + this.currentDayOffset) % 7 + 7) % 7;
    }

    // ---- Rendering ----

    renderWeekView() {
        const container = document.getElementById('weekContainer');
        if (!container) return;

        container.innerHTML = '';
        document.getElementById('weekTitle').textContent = this.getWeekTitle();

        const weekDates = this.getWeekDates();
        weekDates.forEach((date, dayIndex) => {
            const dayTrainings = this.tm.getTrainingsForDay(dayIndex);
            const card = this.createDayCard(dayIndex, date, dayTrainings);
            container.appendChild(card);
        });

        this.updateWeekStats();
    }

    createDayCard(dayIndex, date, trainings) {
        const card = document.createElement('div');
        card.className = 'day-card';

        const completed = trainings.filter(t => t.completed).length;
        if (completed === trainings.length && trainings.length > 0) {
            card.classList.add('completed');
        }

        const dateStr = date.toLocaleDateString('de-DE', { day: 'numeric', month: 'numeric' });

        card.innerHTML = `
            <div class="day-card-header">
                <h3>${CONFIG.WEEKDAYS[dayIndex]}</h3>
                <span class="date">${dateStr}</span>
            </div>
            <div class="day-card-body">
                ${trainings.length > 0 ? `
                    <div class="trainings-list">
                        ${trainings.map(t => this.createTrainingItemHTML(t, true)).join('')}
                    </div>
                ` : `<div class="empty-state"><div class="empty-state-text">Kein Training</div></div>`}
            </div>
        `;

        // Attach listeners
        trainings.forEach(training => {
            const item = card.querySelector(`[data-id="${training.id}"]`);
            if (item) {
                item.addEventListener('click', () => this.openTrainingModal(training.id));
                const checkbox = item.querySelector('.training-checkbox');
                if (checkbox) {
                    checkbox.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.toggleTraining(training.id);
                    });
                }
            }
        });

        return card;
    }

    createTrainingItemHTML(training, isCompact) {
        const typeInfo = CONFIG.TRAINING_TYPES[training.type];
        const notesHTML = training.notes ? `<div class="training-notes">${this.escapeHtml(training.notes)}</div>` : '';

        return `
            <div class="training-item ${training.completed ? 'completed' : ''}" data-id="${training.id}">
                <div class="training-checkbox">
                    ${training.completed ? '✓' : ''}
                </div>
                <div class="training-content">
                    <div class="training-header">
                        <div class="training-title">${this.escapeHtml(training.title)}</div>
                        <div class="training-duration">⏱️ ${training.duration}min</div>
                    </div>
                    <div class="training-type" data-type="${training.type}">${typeInfo.label}</div>
                    ${notesHTML}
                </div>
                <button class="btn-edit" title="Bearbeiten">✏️</button>
            </div>
        `;
    }

    renderDayView() {
        const dayIndex = this.getCurrentDayIndex();
        const date = this.getCurrentDate();
        const dateStr = date.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

        document.getElementById('dayTitle').textContent = dateStr;

        const trainings = this.tm.getTrainingsForDay(dayIndex);
        const container = document.getElementById('dayTrainings');

        if (trainings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📭</div>
                    <div class="empty-state-text">Keine Trainingseinträge für diesen Tag.</div>
                </div>
            `;
        } else {
            container.innerHTML = trainings.map(t => this.createTrainingItemHTML(t, false)).join('');
            trainings.forEach(training => {
                const item = container.querySelector(`[data-id="${training.id}"]`);
                if (item) {
                    item.addEventListener('click', () => this.openTrainingModal(training.id));
                    const checkbox = item.querySelector('.training-checkbox');
                    if (checkbox) {
                        checkbox.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.toggleTraining(training.id);
                        });
                    }
                }
            });
        }

        this.updateDayStats(dayIndex);
    }

    updateWeekStats() {
        const stats = this.sm.getWeekStats([0, 1, 2, 3, 4, 5, 6]);
        document.getElementById('weekProgress').textContent = `${stats.progress}%`;
        document.getElementById('weekCompleted').textContent = `${stats.completed}/${stats.total}`;
    }

    updateDayStats(dayIndex) {
        const stats = this.sm.getDayStats(dayIndex);
        document.getElementById('dayProgress').textContent = `${stats.progress}%`;
    }

    // ---- Modal Management ----

    openTrainingModal(id = null) {
        this.editingId = id;
        const modal = document.getElementById('trainingModal');
        const form = document.getElementById('trainingForm');

        if (id) {
            const training = this.tm.getAllTrainings().find(t => t.id === id);
            if (!training) return;

            document.getElementById('modalTitle').textContent = 'Training bearbeiten';
            document.getElementById('trainingDay').value = training.day;
            document.getElementById('trainingTitle').value = training.title;
            document.getElementById('trainingType').value = training.type;
            document.getElementById('trainingDuration').value = training.duration;
            document.getElementById('trainingNotes').value = training.notes || '';
            document.getElementById('deleteBtn').style.display = 'block';
        } else {
            document.getElementById('modalTitle').textContent = 'Training hinzufügen';
            form.reset();
            const dayIndex = this.getCurrentDayIndex();
            document.getElementById('trainingDay').value = dayIndex;
            document.getElementById('deleteBtn').style.display = 'none';
        }

        this.openModal(modal);
    }

    openStatsModal() {
        const modal = document.getElementById('statsModal');
        const content = document.getElementById('statsContent');

        const stats = this.sm.getOverallStats();

        content.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-label">Gesamt Trainings</div>
                    <div class="stat-value">${stats.total}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Abgeschlossen</div>
                    <div class="stat-value" style="color: #95e1d3;">${stats.completed}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Ausstehend</div>
                    <div class="stat-value" style="color: #ffe66d;">${stats.pending}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Erfolgsquote</div>
                    <div class="stat-value" style="color: #ff6b6b;">${stats.successRate}%</div>
                </div>
            </div>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
                <h3 style="margin-bottom: 12px; font-size: 14px; color: var(--dark);">⏱️ Zeitaufwand</h3>
                <div class="stats-row">
                    <span>Gesamtdauer:</span>
                    <strong>${Math.floor(stats.totalDuration / 60)}h ${stats.totalDuration % 60}min</strong>
                </div>
                <div class="stats-row">
                    <span>Ø pro Training:</span>
                    <strong>${stats.avgDuration} min</strong>
                </div>
                <div class="stats-row">
                    <span>Ø pro Tag:</span>
                    <strong>${stats.avgPerDay} min</strong>
                </div>
            </div>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0;">
                <h3 style="margin-bottom: 12px; font-size: 14px; color: var(--dark);">📊 Nach Trainingsart</h3>
                ${Object.entries(stats.byType).map(([type, data]) => {
                    if (data.count === 0) return '';
                    const typeInfo = CONFIG.TRAINING_TYPES[type];
                    return `
                        <div class="stats-row">
                            <span>${typeInfo.label}</span>
                            <strong>${data.count}x (${data.duration}min)</strong>
                        </div>
                    `;
                }).join('')}
            </div>

            <div style="margin-top: 24px; display: flex; gap: 8px;">
                <button class="btn btn-secondary" onclick="app.exportData()">📥 Export</button>
                <button class="btn btn-secondary" onclick="document.getElementById('importFile').click()">📤 Import</button>
                <input type="file" id="importFile" accept=".json" style="display: none;" onchange="app.importData(event)">
            </div>
        `;

        this.openModal(modal);
    }

    openModal(modal) {
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ---- Form Handling ----

    handleFormSubmit(e) {
        e.preventDefault();

        try {
            const trainingData = {
                day: parseInt(document.getElementById('trainingDay').value),
                title: document.getElementById('trainingTitle').value.trim(),
                type: document.getElementById('trainingType').value,
                duration: parseInt(document.getElementById('trainingDuration').value),
                notes: document.getElementById('trainingNotes').value.trim()
            };

            if (this.editingId) {
                this.tm.updateTraining(this.editingId, trainingData);
                this.emit('trainingUpdated', { id: this.editingId });
            } else {
                this.tm.addTraining(trainingData);
                this.emit('trainingAdded', trainingData);
            }

            this.closeModal(document.getElementById('trainingModal'));
            this.renderWeekView();
            this.renderDayView();
            this.editingId = null;
        } catch (error) {
            alert(`Fehler: ${error.message}`);
        }
    }

    deleteTraining() {
        if (!this.editingId) return;

        if (confirm('Training wirklich löschen?')) {
            try {
                this.tm.deleteTraining(this.editingId);
                this.emit('trainingDeleted', { id: this.editingId });
                this.closeModal(document.getElementById('trainingModal'));
                this.renderWeekView();
                this.renderDayView();
                this.editingId = null;
            } catch (error) {
                alert(`Fehler: ${error.message}`);
            }
        }
    }

    toggleTraining(id) {
        try {
            this.tm.toggleCompletion(id);
            this.emit('trainingToggled', { id });
            this.renderWeekView();
            this.renderDayView();
        } catch (error) {
            alert(`Fehler: ${error.message}`);
        }
    }

    // ---- View Switching ----

    switchView(viewName) {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.view === viewName) {
                tab.classList.add('active');
            }
        });

        document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
        document.getElementById(viewName + 'View').classList.add('active');

        if (viewName === 'week') {
            this.renderWeekView();
        } else {
            this.renderDayView();
        }
    }

    // ---- Navigation ----

    prevWeek() {
        this.currentWeekOffset--;
        this.renderWeekView();
    }

    nextWeek() {
        this.currentWeekOffset++;
        this.renderWeekView();
    }

    prevDay() {
        this.currentDayOffset--;
        this.renderDayView();
    }

    nextDay() {
        this.currentDayOffset++;
        this.renderDayView();
    }

    // ---- Utility ----

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ---- Dark Mode ----

    toggleDarkMode() {
        const isDarkMode = document.body.classList.toggle('dark-mode');
        StorageManager.save(CONFIG.DARK_MODE_KEY, isDarkMode);
        this.updateDarkModeButton();
    }

    loadDarkModeSetting() {
        const isDarkMode = StorageManager.load(CONFIG.DARK_MODE_KEY, false);
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        }
        this.updateDarkModeButton();
    }

    updateDarkModeButton() {
        const btn = document.getElementById('darkModeToggle');
        if (btn) {
            btn.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        }
    }

    // ---- Export / Import ----

    exportData() {
        try {
            const data = this.tm.export();
            const json = JSON.stringify(data, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `fitnessPlan_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            alert(`Export-Fehler: ${error.message}`);
        }
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.tm.import(data);
                alert('Daten erfolgreich importiert!');
                this.renderWeekView();
                this.renderDayView();
            } catch (error) {
                alert(`Import-Fehler: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
}

// ==================== HAUPTANWENDUNG ====================

class FitnessPlanApp {
    constructor() {
        this.tm = new TrainingManager();
        this.sm = new StatisticsManager(this.tm);
        this.ui = new UIManager(this.tm, this.sm);
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.ui.loadDarkModeSetting();
        this.ui.renderWeekView();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.ui.switchView(e.target.dataset.view));
        });

        // Week Navigation
        document.getElementById('prevWeek')?.addEventListener('click', () => this.ui.prevWeek());
        document.getElementById('nextWeek')?.addEventListener('click', () => this.ui.nextWeek());

        // Day Navigation
        document.getElementById('prevDay')?.addEventListener('click', () => this.ui.prevDay());
        document.getElementById('nextDay')?.addEventListener('click', () => this.ui.nextDay());

        // FAB & Buttons
        document.getElementById('addBtn')?.addEventListener('click', () => this.ui.openTrainingModal());
        document.getElementById('statsBtn')?.addEventListener('click', () => this.ui.openStatsModal());
        document.getElementById('darkModeToggle')?.addEventListener('click', () => this.ui.toggleDarkMode());

        // Modal Close
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.ui.closeModal(modal);
            });
        });

        // Modal Background Click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.ui.closeModal(modal);
                }
            });
        });

        // Form
        document.getElementById('trainingForm')?.addEventListener('submit', (e) => this.ui.handleFormSubmit(e));
        document.getElementById('deleteBtn')?.addEventListener('click', () => this.ui.deleteTraining());
    }

    // ---- Public API ----

    exportData() {
        this.ui.exportData();
    }

    importData(event) {
        this.ui.importData(event);
    }

    getTrainings() {
        return this.tm.getAllTrainings();
    }

    getStats() {
        return this.sm.getOverallStats();
    }

    addTraining(training) {
        return this.tm.addTraining(training);
    }

    deleteTraining(id) {
        this.tm.deleteTraining(id);
        this.ui.renderWeekView();
        this.ui.renderDayView();
    }
}

// ==================== INITIALISIERUNG ====================

let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new FitnessPlanApp();
    console.log('🏋️ FitnessPlan App initialized successfully!');
});

// Export für externe Nutzung
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FitnessPlanApp,
        TrainingManager,
        StatisticsManager,
        UIManager,
        StorageManager,
        CONFIG
    };
}
