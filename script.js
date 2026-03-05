const prayerAPI = "https://api.aladhan.com/v1/timings"
const hijriAPI = "https://api.aladhan.com/v1/gToH"

let timings = {}
let latitude, longitude

// AUDIO
const adzanSubuh = new Audio("audio/adzan-subuh.mp3")
const adzan = new Audio("audio/adzan.mp3")
const imsakSound = new Audio("audio/imsak.mp3")
const notifySound = new Audio("audio/notify.mp3")

// LOCATION DETECTION TIMER
let countdown = 13
const detectEl = document.getElementById("detectCountdown")

const timer = setInterval(() => {

    countdown--
    detectEl.innerText = "(" + countdown + ")"

    if (countdown <= 0) {

        clearInterval(timer)
        detectByIP()

    }

}, 1000)


// TRY GPS LOCATION
navigator.geolocation.getCurrentPosition(

    pos => {
        clearInterval(timer)

        latitude = pos.coords.latitude
        longitude = pos.coords.longitude

        document.getElementById("locationMethod")
            .innerText = "Location by Browser GPS"

        fetchCityName(latitude, longitude)
        fetchPrayer()

    },

    err => {

        detectByIP()

    }

)


// IP FALLBACK
function detectByIP() {

    fetch("https://ipapi.co/json")

        .then(res => res.json())

        .then(data => {

            latitude = data.latitude
            longitude = data.longitude

            document.getElementById("location")
                .innerText = data.city + ", " + data.country_name

            document.getElementById("locationMethod")
                .innerText = "Location by IP detection"

            fetchPrayer()

        })

}


// GET CITY NAME
function fetchCityName(lat, lon) {

    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)

        .then(res => res.json())

        .then(data => {

            let city = data.address.city || data.address.town || data.address.village

            document.getElementById("location")
                .innerText = city + ", " + data.address.country

        })

}


// FETCH PRAYER TIMES
function fetchPrayer() {

    let url = `${prayerAPI}?latitude=${latitude}&longitude=${longitude}&method=2`

    fetch(url)
        .then(res => res.json())
        .then(data => {

            timings = data.data.timings

            document.getElementById("imsakTime").innerText = timings.Imsak
            document.getElementById("maghribTime").innerText = timings.Maghrib

            populateTable()

        })

}


// PRAYER TABLE
function populateTable() {

    let table = document.getElementById("prayerTable")

    table.innerHTML = ""

    Object.entries(timings).forEach(([name, time]) => {

        if (["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"].includes(name)) {

            table.innerHTML += `
<tr>
<td>${name}</td>
<td>${time}</td>
</tr>
`

        }

    })

}


// DIGITAL CLOCK
function updateClock() {

    let now = new Date()

    document.getElementById("digitalClock").innerText =
        now.toLocaleTimeString()

    document.getElementById("date").innerText =
        now.toDateString()

}

setInterval(updateClock, 1000)


// ANALOG CLOCK
const canvas = document.getElementById("analogClock")
const ctx = canvas.getContext("2d")

function drawClock() {

    let now = new Date()

    let radius = canvas.height / 2

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.translate(radius, radius)

    radius *= 0.9

    drawFace(ctx, radius)
    drawNumbers(ctx, radius)
    drawTime(ctx, radius)

}

function drawFace(ctx, radius) {

    ctx.beginPath()
    ctx.arc(0, 0, radius, 0, 2 * Math.PI)
    ctx.fillStyle = "white"
    ctx.fill()

}

function drawNumbers(ctx, radius) {

    ctx.font = radius * 0.15 + "px arial"
    ctx.textBaseline = "middle"
    ctx.textAlign = "center"

    for (let num = 1; num < 13; num++) {

        let ang = num * Math.PI / 6

        ctx.rotate(ang)
        ctx.translate(0, -radius * 0.85)
        ctx.rotate(-ang)

        ctx.fillText(num.toString(), 0, 0)

        ctx.rotate(ang)
        ctx.translate(0, radius * 0.85)
        ctx.rotate(-ang)

    }

}

function drawTime(ctx, radius) {

    let now = new Date()

    let hour = now.getHours()
    let minute = now.getMinutes()
    let second = now.getSeconds()

    hour = hour % 12
    hour = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60))

    drawHand(ctx, hour, radius * 0.5, radius * 0.07)

    minute = (minute * Math.PI / 30)

    drawHand(ctx, minute, radius * 0.8, radius * 0.07)

    second = (second * Math.PI / 30)

    drawHand(ctx, second, radius * 0.9, radius * 0.02)

}

function drawHand(ctx, pos, length, width) {

    ctx.beginPath()
    ctx.lineWidth = width
    ctx.lineCap = "round"

    ctx.moveTo(0, 0)
    ctx.rotate(pos)
    ctx.lineTo(0, -length)

    ctx.stroke()

    ctx.rotate(-pos)

}

setInterval(drawClock, 1000)


// HIJRI DATE
function updateHijri() {

    let today = new Date()

    let d = today.getDate()
    let m = today.getMonth() + 1
    let y = today.getFullYear()

    fetch(`${hijriAPI}/${d}-${m}-${y}`)

        .then(res => res.json())

        .then(data => {

            document.getElementById("hijri").innerText =
                data.data.hijri.date + " Hijri"

        })

}

updateHijri()




// TOGGLE SCHEDULE
document.getElementById("toggleSchedule")
    .onclick = () => {

        document.getElementById("schedule")
            .classList.toggle("collapsed")

    }