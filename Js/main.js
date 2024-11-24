document.getElementById("calculator-form").addEventListener("submit", function (event) {
    event.preventDefault();

    const plastic = parseFloat(document.getElementById("plastic").value) || 0;
    const paper = parseFloat(document.getElementById("paper").value) || 0;
    const glass = parseFloat(document.getElementById("glass").value) || 0;

    const plasticSaved = plastic * 3.8; 
    const paperSaved = paper * 17; 
    const glassSaved = glass * 2; 
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = `
      პლასტიკის გადარჩენილი რესურსი: ${plasticSaved.toFixed(2)} ლიტრი წყალი<br>
      ქაღალდის გადარჩენილი რესურსი: ${paperSaved.toFixed(2)} ხე<br>
      მინის გადარჩენილი რესურსი: ${glassSaved.toFixed(2)} ლიტრი წყალი
    `;
    resultsDiv.style.display = "block";
});
