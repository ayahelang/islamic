const api = "https://api.aladhan.com/v1/timings";

let timings = {}

function getLocation() {

    navigator.geolocation.getCurrentPosition(pos => {

        let lat = pos.coords.latitude
        let lon = pos.coords.longitude

        fetchPrayer(lat, lon)

    })

}

function fetchPrayer(lat, lon) {

    let url = `${api}?latitude=${lat}&longitude=${lon}&method=2`

    fetch(url)
        .then(res => res.json())
        .then(data => {

            timings = data.data.timings

            document.getElementById("imsakTime").innerText = timings.Imsak
            document.getElementById("maghribTime").innerText = timings.Maghrib

            populateTable()

        })

}

function populateTable() {

    let table = document.getElementById("prayerTable")

    Object.entries(timings).forEach(([name, time]) => {

        if (["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(name)) {

            table.innerHTML += `<tr>
<td>${name}</td>
<td>${time}</td>
</tr>`

        }

    })

}

function updateClock() {

    let now = new Date()

    document.getElementById("digitalClock").innerText =
        now.toLocaleTimeString()

    document.getElementById("date").innerText =
        now.toDateString()

}

setInterval(updateClock, 1000)

document.getElementById("toggleSchedule")
    .onclick = () => {

        document.getElementById("schedule")
            .classList.toggle("collapsed")

    }

function playSound(file) {

    new Audio("audio/" + file).play()

}

function checkPrayer() {

    let now = new Date()

    let current = now.getHours() + ":" + now.getMinutes()

    Object.entries(timings).forEach(([name, time]) => {

        if (time === current) {

            if (name === "Fajr")
                playSound("adzan-subuh.mp3")

            else if (name === "Imsak")
                playSound("imsak.mp3")

            else
                playSound("adzan.mp3")

        }

    })

}

setInterval(checkPrayer, 30000)

getLocation()