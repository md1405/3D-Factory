import { equipmentData } from '../factory/EquipmentData';

export default class ConfigManager {
    constructor() {
        this.activeEquipmentId = null;
        this.onConfigChange = null; // Callback: (equipmentId, config) => void
        
        this.panel = document.getElementById('config-panel');
        this.content = document.getElementById('config-content');
        this.title = document.getElementById('config-title');
        this.specsContainer = document.getElementById('config-specs');
        
        this.buildEquipmentSelector();
        this.hide();
    }

    buildEquipmentSelector() {
        const selector = document.getElementById('config-equipment-selector');
        if (!selector) return;
        
        selector.innerHTML = '';
        
        Object.values(equipmentData).forEach(equip => {
            const option = document.createElement('option');
            option.value = equip.id;
            option.textContent = equip.name;
            selector.appendChild(option);
        });
        
        selector.addEventListener('change', (e) => {
            this.selectEquipment(e.target.value);
        });
        
        // Select first equipment by default
        const firstId = Object.keys(equipmentData)[0];
        this.selectEquipment(firstId);
        selector.value = firstId;
    }

    selectEquipment(equipmentId) {
        this.activeEquipmentId = equipmentId;
        const equip = equipmentData[equipmentId];
        
        if (!equip || !equip.config) {
            this.content.innerHTML = '<p style="color: #64748b; padding: 20px;">No configurable options for this equipment.</p>';
            return;
        }
        
        // Update title
        if (this.title) {
            this.title.textContent = equip.name;
        }
        
        // Build config UI
        this.buildConfigUI(equip);
        
        // Update specs
        this.updateSpecs(equipmentId);
        
        // Show panel
        if (this.panel) {
            this.panel.classList.add('visible');
        }
    }

    buildConfigUI(equip) {
        if (!this.content) return;
        
        this.content.innerHTML = '';
        
        // Loop through config properties
        Object.entries(equip.config).forEach(([key, config]) => {
            const section = document.createElement('div');
            section.className = 'config-section';
            
            const label = document.createElement('div');
            label.className = 'config-label';
            label.textContent = config.label;
            section.appendChild(label);
            
            if (config.type === 'radio') {
                config.options.forEach(option => {
                    const btn = document.createElement('button');
                    btn.className = 'config-radio-btn';
                    btn.textContent = option.label;
                    
                    // Check if this is the current selection
                    if (equip.currentConfig[key] === option.value) {
                        btn.classList.add('active');
                    }
                    
                    btn.addEventListener('click', () => {
                        // Update UI
                        section.querySelectorAll('.config-radio-btn').forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        
                        // Update state
                        equip.currentConfig[key] = option.value;
                        
                        // Update specs display
                        this.updateSpecs(this.activeEquipmentId);
                        
                        // Fire callback
                        if (this.onConfigChange) {
                            this.onConfigChange(this.activeEquipmentId, { ...equip.currentConfig });
                        }
                    });
                    
                    section.appendChild(btn);
                });
            } else if (config.type === 'checkbox') {
                const checkbox = document.createElement('label');
                checkbox.className = 'config-checkbox-label';
                
                const input = document.createElement('input');
                input.type = 'checkbox';
                input.checked = equip.currentConfig[key];
                
                const span = document.createElement('span');
                span.textContent = config.label;
                
                input.addEventListener('change', () => {
                    equip.currentConfig[key] = input.checked;
                    
                    this.updateSpecs(this.activeEquipmentId);
                    
                    if (this.onConfigChange) {
                        this.onConfigChange(this.activeEquipmentId, { ...equip.currentConfig });
                    }
                });
                
                checkbox.appendChild(input);
                checkbox.appendChild(span);
                section.appendChild(checkbox);
            }
            
            this.content.appendChild(section);
        });
    }

    updateSpecs(equipmentId) {
        if (!this.specsContainer) return;
        
        const equip = equipmentData[equipmentId];
        const currentConfig = equip.currentConfig;
        
        let specsHTML = '<div class="config-specs-title">Current Specifications</div>';
        
        // Collect specs from current config selections
        Object.entries(equip.config).forEach(([key, config]) => {
            const currentValue = currentConfig[key];
            
            if (config.type === 'radio') {
                const selectedOption = config.options.find(o => o.value === currentValue);
                if (selectedOption?.specs) {
                    selectedOption.specs.forEach(spec => {
                        specsHTML += `
                            <div class="config-spec-item">
                                <span class="config-spec-label">${spec.label}</span>
                                <span class="config-spec-value">${spec.value}</span>
                            </div>
                        `;
                    });
                }
            } else if (config.type === 'checkbox') {
                if (currentValue && config.specs) {
                    config.specs.forEach(spec => {
                        specsHTML += `
                            <div class="config-spec-item">
                                <span class="config-spec-label">${spec.label}</span>
                                <span class="config-spec-value">${spec.value}</span>
                            </div>
                        `;
                    });
                }
            }
        });
        
        // Add base specs
        if (equip.info?.en?.specs) {
            equip.info.en.specs.forEach(spec => {
                specsHTML += `
                    <div class="config-spec-item">
                        <span class="config-spec-label">${spec.label}</span>
                        <span class="config-spec-value">${spec.value}</span>
                    </div>
                `;
            });
        }
        
        this.specsContainer.innerHTML = specsHTML;
    }

    hide() {
        if (this.panel) {
            this.panel.classList.remove('visible');
        }
    }

    show() {
        if (this.panel) {
            this.panel.classList.add('visible');
        }
    }

    toggle() {
        if (this.panel) {
            this.panel.classList.toggle('visible');
        }
    }
}