document.getElementById("choose").addEventListener("change", function () {
    if (this.value === "true") {
        resetSubs();
        addNewSubInput();
    } else {
        resetSubs();
    }
});

function resetSubs() {
    document.querySelectorAll(".subname").forEach(e => e.remove());
}

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
        inp.oninput = () => handleInput();
    });
}

function handleInput() {
    let inputs = [...document.querySelectorAll(".subInp")];

    let emptyInputs = inputs.filter(i => i.value.trim() === "");

    if (emptyInputs.length > 1) {
        emptyInputs[emptyInputs.length - 1].parentElement.remove();
        return;
    }

    let allFilled = inputs.every(i => i.value.trim() !== "");
    if (allFilled) {
        addNewSubInput();
    }
}
