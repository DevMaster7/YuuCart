document.querySelectorAll(".edit").forEach((e) => {
    e.addEventListener("click", () => {
        let card = e.closest(".coupan-box");
        card.querySelectorAll(".edited-info").forEach((e) => {
            // if (e.parentElement.innerText.includes("End") || e.parentElement.innerText.includes("Start")) {
            //     let dateInp = document.createElement("input");
            //     dateInp.setAttribute("type", "date");
            //     dateInp.value = e.innerHTML;
            //     dateInp.style.width = (dateInp.value.length + 1) + "ch";
            //     e.replaceWith(dateInp);
            //     // console.log(e);
            // }
            let input = document.createElement("input");
            input.classList.add("edited-input");
            input.value = e.innerHTML;
            input.style.width = (input.value.length + 1) + "ch";
            e.replaceWith(input);
        });
        inputs();
    });
});

function inputs() {
    document.querySelectorAll(".edited-input").forEach((inp) => {
        inp.addEventListener("input", () => {
            inp.style.width = (inp.value.length + 1) + "ch";
        });
    });
}
