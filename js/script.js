let qrCodeObj = null;
let roleAktif = "";

function toggleDropdown() {
    document.getElementById("dropdown-list").classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.dropdown-selected')) {
        let dropdowns = document.getElementsByClassName("dropdown-list");
        for (let i = 0; i < dropdowns.length; i++) {
            if (dropdowns[i].classList.contains('show')) {
                dropdowns[i].classList.remove('show');
            }
        }
    }
}

// Fungsi untuk membuat 4 digit nomor acak (1000 - 9999)
function generateRandomID() {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('id_user').value = randomNumber;
}

function pilihRole(role) {
    roleAktif = role;
    const textSelected = document.getElementById("dropdown-selected");
    const divisiInput = document.getElementById("divisi");

    let labelUI = role;
    if (role === 'Anak Magang') labelUI = 'Magang';

    textSelected.innerText = `> ${labelUI}`;
    
    if (role === 'Pelajar') {
        divisiInput.disabled = false;
        divisiInput.value = "";
        divisiInput.placeholder = "Ketik Kelas Anda";
        divisiInput.focus();
    } else {
        divisiInput.disabled = true;
        divisiInput.value = role; 
        divisiInput.placeholder = "Otomatis";
    }
}

function buatQR() {
    const id = document.getElementById('id_user').value.trim();
    const nama = document.getElementById('nama').value.trim();
    const gender = document.getElementById('gender').value;
    const divisi = document.getElementById('divisi').value.trim();

    if (!id || !nama || !gender || !roleAktif) {
        alert("Nomor, Nama, Jenis Kelamin, dan Role wajib diisi!");
        return;
    }
    if (roleAktif === 'Pelajar' && !divisi) {
        alert("Untuk Pelajar, kolom Kelas wajib diisi!");
        return;
    }

    // Format QR Terbaru: ID|Nama|Kelas/Divisi|Role|Jenis Kelamin
    const dataQR = `${id}|${nama}|${divisi}|${roleAktif}|${gender}`;
    document.getElementById("display-nama").innerText = nama;

    const qrContainer = document.getElementById("qrcode-container");
    qrContainer.innerHTML = ""; 

    qrCodeObj = new QRCode(qrContainer, {
        text: dataQR,
        width: 400, 
        height: 400,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    document.getElementById("preview-wrapper").style.display = "flex";
    
    if (window.innerWidth < 850) {
        setTimeout(() => {
            document.getElementById("preview-wrapper").scrollIntoView({ behavior: "smooth" });
        }, 100);
    }
}

function downloadKartu() {
    const qrCanvasAsli = document.querySelector('#qrcode-container canvas');
    if (!qrCanvasAsli) return;

    const canvasWidth = 630;
    const canvasHeight = 880;
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    // 1. Background Hijau
    ctx.fillStyle = "#81d157"; 
    ctx.beginPath();
    ctx.roundRect(0, 0, canvasWidth, canvasHeight, 40);
    ctx.fill();

    // 2. Kotak Putih (Tempat QR)
    ctx.fillStyle = "#ffffff"; 
    ctx.beginPath();
    ctx.roundRect(40, 40, 550, 550, 25); 
    ctx.fill();

    // 3. QR Code Image
    ctx.drawImage(qrCanvasAsli, 75, 75, 480, 480);

    // 4. Teks Nama
    const namaUser = document.getElementById('nama').value.trim();
    ctx.fillStyle = "#000000";
    ctx.textAlign = "center";
    
    let fontSize = 60;
    if (namaUser.length > 15) fontSize = 45;
    if (namaUser.length > 25) fontSize = 35;
    
    ctx.font = `bold ${fontSize}px "Segoe UI", sans-serif`;
    ctx.fillText(namaUser, 315, 730);

    // 5. Label Ukuran Kartu
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.textAlign = "right";
    ctx.font = "bold 22px 'Segoe UI', sans-serif";
    ctx.fillText("6,3 x 8,8 cm", 580, 840);

    // 6. Eksekusi Download
    const url = canvas.toDataURL("image/png");
    const a = document.createElement('a');
    const divisi = document.getElementById('divisi').value.trim();
    a.download = `ID_Kartu_${namaUser.replace(/\s+/g, '_')}_${divisi}.png`;
    a.href = url;
    a.click();
}