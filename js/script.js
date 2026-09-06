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

function generateRandomID() {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('id_user').value = randomNumber;
}

function pilihRole(role) {
    roleAktif = role;
    const textSelected = document.getElementById("dropdown-selected");
    const divisiInput = document.getElementById("divisi");
    
    const selectGelar = document.getElementById("selectGelar");
    const selectJabatan = document.getElementById("selectJabatan");

    let labelUI = role;
    if (role === 'Anak Magang') labelUI = 'Magang';

    textSelected.innerText = `> ${labelUI}`;
    
    // Tampilkan Kotak Gelar/Jabatan berdasarkan Role
    if (role === 'Guru') {
        selectGelar.style.display = "block";
        selectJabatan.style.display = "none";
        selectJabatan.value = "";
    } else if (role === 'Karyawan') {
        selectGelar.style.display = "none";
        selectJabatan.style.display = "block";
        selectGelar.value = "";
    } else {
        selectGelar.style.display = "none";
        selectJabatan.style.display = "none";
        selectGelar.value = "";
        selectJabatan.value = "";
    }

    // Atur Input Divisi/Kelas
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
    let namaInput = document.getElementById('nama').value.trim();
    const gender = document.getElementById('gender').value;
    const divisi = document.getElementById('divisi').value.trim();

    if (!id || !namaInput || !gender || !roleAktif) {
        alert("Nomor, Nama, Jenis Kelamin, dan Role wajib diisi!");
        return;
    }
    if (roleAktif === 'Pelajar' && !divisi) {
        alert("Untuk Pelajar, kolom Kelas wajib diisi!");
        return;
    }

    // Penggabungan Nama dengan Gelar / Jabatan
    let namaLengkap = namaInput;
    if (roleAktif === 'Guru') {
        const gelar = document.getElementById('selectGelar').value;
        if (gelar) namaLengkap = `${namaInput}, ${gelar}`;
    } else if (roleAktif === 'Karyawan') {
        const jabatan = document.getElementById('selectJabatan').value;
        if (jabatan) namaLengkap = `${namaInput} - ${jabatan}`;
    }

    // Format Data QR Code
    const dataQR = `${id}|${namaLengkap}|${divisi}|${roleAktif}|${gender}`;
    
    // Update Teks Nama di Kartu Preview
    document.getElementById("display-nama").innerText = namaLengkap;

    // Ganti Gambar Background Berdasarkan Gender (Folder Template/)
    const cardPreview = document.getElementById("id-card-preview");
    const templatePath = (gender === 'Perempuan') ? 'Template/template_pink.jpg' : 'Template/template_biru.jpg';
    cardPreview.style.backgroundImage = `url('${templatePath}')`;

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

    const gender = document.getElementById('gender').value;
    const namaUser = document.getElementById('display-nama').innerText;
    const divisi = document.getElementById('divisi').value.trim();

    const templatePath = (gender === 'Perempuan') ? 'Template/template_pink.jpg' : 'Template/template_biru.jpg';

    const canvasWidth = 700;
    const canvasHeight = 1000;
    
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    const bgImg = new Image();
    bgImg.src = templatePath;
    bgImg.onload = function() {
        // 1. Render Background
        ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);

        // 2. Kotak Putih Penutup Placeholder (Presisi 580x580)
        const boxX = 60;
        const boxY = 83;
        const boxSize = 580;

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        if (ctx.roundRect) {
            ctx.roundRect(boxX, boxY, boxSize, boxSize, 42);
        } else {
            ctx.rect(boxX, boxY, boxSize, boxSize);
        }
        ctx.fill();

        // 3. Render QR Code di Tengah Kotak Putih
        const padding = 30;
        const qrSize = boxSize - (padding * 2);
        ctx.drawImage(qrCanvasAsli, boxX + padding, boxY + padding, qrSize, qrSize);

        // 4. Render Nama dengan Font Ceria Fredoka
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        // Auto-scale font sesuai panjang nama
        let fontSize = 46;
        if (namaUser.length > 15) fontSize = 36;
        if (namaUser.length > 22) fontSize = 28;

        ctx.font = `bold ${fontSize}px "Fredoka", "Comic Sans MS", cursive, sans-serif`;
        ctx.fillText(namaUser, canvasWidth / 2, 725);

        // Reset Shadow Effect
        ctx.shadowColor = "transparent";

        // 5. Eksekusi Download File PNG
        const url = canvas.toDataURL("image/png");
        const a = document.createElement('a');
        a.download = `ID_Kartu_${namaUser.replace(/\s+/g, '_')}_${divisi}.png`;
        a.href = url;
        a.click();
    };
}
