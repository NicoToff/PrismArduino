const searchButton = document.querySelector("#search-button");
const searchBar = document.querySelector("#db-search");
const resultTableBody = document.querySelector("#result-table-body");
const recordNumber = document.querySelector("#record-number");

clearInput(searchBar);

searchButton.addEventListener("click", () => {
    const id = Number(searchBar.value);
    if (isNaN(id) || id <= 0) {
        alert(searchBar.value + " is not a valid id!");
        clearInput(searchBar);
        return;
    }
    let postSearch = new XMLHttpRequest();
    postSearch.onreadystatechange = () => {
        if (postSearch.readyState === 4) {
            let response;
            try {
                response = JSON.parse(postSearch.response);
                if (response.length === 0) {
                    alert("No data for this id.");
                } else {
                    recordNumber.innerText = `Enregistrement #${response[0].idRecord}`;
                    for (let i = 0; i < response.length; i++) {
                        const entry = response[i];
                        let tr = document.createElement("tr");
                        let tdId = document.createElement("td");
                        let tdMesure = document.createElement("td");
                        let tdHeure = document.createElement("td");
                        tdId.innerText = entry.id;
                        tdMesure.innerText = entry.mesure;
                        tdHeure.innerText = new Date(entry.horodatage).toUTCString();
                        tr.append(tdId, tdMesure, tdHeure);
                        resultTableBody.append(tr);
                    }
                }
            } catch (error) {
                console.error("Error parsing data");
            }
        }
    };
    postSearch.open("POST", "/api/db", true);
    postSearch.setRequestHeader("Content-type", "application/json");
    postSearch.send(JSON.stringify({ search: id }));
    clearInput(searchBar);
});

function clearInput(input) {
    input.value = "";
}
