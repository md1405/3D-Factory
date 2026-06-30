export default class InfoPanel {
    constructor() {
        this.container = document.createElement("div");
        this.container.id = "info-panel";
        this.container.innerHTML = `
            <div id="info-panel-content">
                <div class="label">Selected Equipment</div>
                <h3 id="info-title"></h3>
                <p id="info-description"></p>
            </div>
        `;
        document.body.appendChild(this.container);
        this.hide();
    }

    show(title, description) {
        const titleEl = document.getElementById("info-title");
        const descEl = document.getElementById("info-description");
        
        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = description;
        
        this.container.style.display = "block";
    }

    hide() {
        this.container.style.display = "none";
    }
}