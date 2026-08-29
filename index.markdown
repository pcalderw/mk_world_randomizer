---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
---


<table id="rng">
    <thead>
        <tr>
        <th scope="col">Kart</th>
        <th scope="col">First Race</th>
        <th scope="col">Second Race</th>
        <th scope="col">Third Race</th>
        <th scope="col">Final Race</th>
        </tr>
    </thead>
    <tr>
        <td id="kart-entry" rowspan="2"></td>
        <td id="course-0-option-0"></td>
        <td id="course-1-option-0"></td>
        <td id="course-2-option-0"></td>
        <td id="course-3-option-0"></td>
    </tr>
    <tr>
        <td id="course-0-option-1"></td>
        <td id="course-1-option-1"></td>
        <td id="course-2-option-1"></td>
        <td id="course-3-option-1"></td>
    </tr>
</table>

<script>
    function getHistory(){
        return JSON.parse(localStorage.getItem("mkw_selected_courses") ?? '[]')
    }

    function updateHistory(course){
        let history = getHistory()
        history.push(course)
        localStorage.setItem("mkw_selected_courses", JSON.stringify(history))
        renderHistoryFromStorage()
    }

    function selectOption(raceNumber, course1, course2){
        // TODO save history 
        document.getElementById(`button-${raceNumber}-0`).disabled = true
        const button2 = document.getElementById(`button-${raceNumber}-1`)
        if(button2){
            button2.disabled = true
        }

        if (course2 == null){
            updateHistory(course1)
        } 

        if ((raceNumber + 1) < 4) {
            randomizeCourses(raceNumber + 1)
        }

    }

    function presentOptions(raceNumber, optionNumber, course1, course2){
        let option = document.getElementById(`course-${raceNumber}-option-${optionNumber}`)
        let buttonId = `button-${raceNumber}-${optionNumber}`
        let button = `<button id="${buttonId}" type="button">Select</button>`
        if (course2 != null){
            img = `<img src = "${course1.img}" /><img src = "${course2.img}" />`
            text = `<strong>${course1.name}</strong> to <strong>${course2.name}</strong>`
        } else {
            img = `<img src = "${course1.img}"/>`
            text = `<strong>${course1.name}</strong>`
        }
        option.innerHTML = `${img}<br>${text}<br>${button}`

        document.getElementById(buttonId).addEventListener('click', () => {
            selectOption(raceNumber, course1, course2)
        });
    }

    function randomizeCourses(raceNumber){
        const courses = window.mkw.courses
        const history = getHistory();
        const recentHistory = history.slice(-16) // last 16 history
        let randomCourses = Array();
        while(randomCourses.length < 2) {
            let course1 = courses[Math.floor(Math.random() * courses.length)].name
            let course2 = courses[Math.floor(Math.random() * courses.length)].name
            if(course1 == course2){
                continue
            }
            if (randomCourses.includes(course1) || randomCourses.includes(course2) || recentHistory.includes(course1) || recentHistory.includes(course2)){
                continue
            }
            randomCourses.push(course1, course2)
        }

        let course1 = courses.find(course => course.name == randomCourses[0])
        let isConnector1 = course1.connectors.includes(randomCourses[1])
        let course2 = courses.find(course => course.name == randomCourses[1])
        let isConnector2 = course2.connectors.includes(randomCourses[0])
        
        let isConnector = isConnector1 || isConnector2

        if (!isConnector) {
            presentOptions(raceNumber, 0, course1, null)
            presentOptions(raceNumber, 1, course2, null)
        } else if(isConnector1 && !isConnector2){
            presentOptions(raceNumber, 0, course1, course2)
        } else if(isConnector2 && !isConnector1){
            presentOptions(raceNumber, 0, course2, course1)
        } else {
            presentOptions(raceNumber, 0, course1, course2)
            presentOptions(raceNumber, 1, course2, course1)
        }
    }
</script>

<script>
    const karts = window.mkw.karts
    let randomKart = karts[Math.floor(Math.random() * karts.length)]

    let kartEntry = document.getElementById("kart-entry")
    kartEntry.innerHTML = 
    `<img src = "${randomKart.img}"/><br><strong>${randomKart.name}</strong>`
    let randomCourses = Array();

   randomizeCourses(0)
</script>

<table border="1">
  <thead>
    <tr>
      <th>Race History</th>
    </tr>
  </thead>
  <!-- The rows will be injected here dynamically -->
  <tbody id="table-body"></tbody>
</table>
<p>History prevents getting the same course (or a connector from it) for 16 races. A connector map doesn't get saved to history.</p>

<script>
    function renderHistoryFromStorage() {
    const history = getHistory().slice(-16)
    const tableBody = document.getElementById("table-body");

    // Clear existing content to prevent duplicate rows if re-rendering
    tableBody.innerHTML = "";

    // 4. Loop through the array and build table rows
    history.reverse().forEach(race => {
        // Create a new row element
        const row = document.createElement("tr");

        // Populate the row with columns matching your data structure
        row.innerHTML = `
        <td>${race.name }</td>
        `;

        // Append the row to the table body
        tableBody.appendChild(row);
    });
    }

    // Run the function when the page loads
    document.addEventListener("DOMContentLoaded", renderHistoryFromStorage);
    window.addEventListener('storage', (event) => {
        if (event.key === 'mkw_selected_courses') {
            renderHistoryFromStorage(); 
        }
});
</script>

<!-- 
<table>
<thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Icon</th>
      <th scope="col">Connectors</th>
      <th scope="col">Connection Count</th>
    </tr>
  </thead>
{% for course in site.data.courses %}
    <tr>
        <td>{{ course.name }}</td>
        <td><img src='{{ course.img }}'/></td>
        <td>{% for conn in course.connectors %}
        {% assign connector_name = conn %}
        {% assign connector = site.data.courses | where: 'name', connector_name | first %}
        <img src='{{ connector.img | default: "Error" }}'/>{{ conn }}<br>{% endfor %}</td>
        <td>{{ course.connectors.size }}</td>
    </tr>
{% endfor %}
</table> -->
