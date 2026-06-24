export default class InfoPanel {

    constructor() {

        this.container =
            document.createElement("div");

        this.container.id = "info-panel";

        this.container.innerHTML = `
            <h3 id="info-title"></h3>
            <p id="info-description"></p>
        `;

        document.body.appendChild(
            this.container
        );

        this.hide();
    }

    show(title, description) {

        document.getElementById(
            "info-title"
        ).innerText = title;

        document.getElementById(
            "info-description"
        ).innerText = description;

        this.container.style.display =
            "block";
    }

    hide() {

        this.container.style.display =
            "none";
    }
}