document.getElementById("choose").addEventListener("change", function () {
    if (this.value == "true") {
        addNewSubInput();
    } else {
        document.querySelectorAll(".subname").forEach(e => e.remove());
    }
});
function addNewSubInput() {
    let inputHTML = `
        <div class="field subname">
            <input type="text" class="subInp" name="SubName" placeholder=" " />
            <label>SubCategory Name</label>
        </div>`;

    document.querySelector(".inputs").insertAdjacentHTML("beforeend", inputHTML);

    attachListeners(); 
}
function attachListeners() {
    document.querySelectorAll(".subInp").forEach(inp => {
        inp.oninput = () => checkAndAdd();
    });
}
function checkAndAdd() {
    let allInputs = [...document.querySelectorAll(".subInp")];

    let allFilled = allInputs.every(i => i.value.trim() !== "");

    if (allFilled) {
        addNewSubInput();
    }
}

