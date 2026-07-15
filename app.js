// Logic tự động tính toán Âm Lịch và gửi dữ liệu cho Thiệp Cưới An Như (Không chia bước, không danh sách khách mời)

const FIREBASE_DB_URL = "https://wedding-invitation-default-default-rtdb.asia-southeast1.firebasedatabase.app/submissions";

// --- CHECKBOX ĐỒNG Ý: Bật/tắt nút Gửi ---
document.addEventListener('DOMContentLoaded', () => {
    const agreeBox = document.getElementById('agreeCheckbox');
    const btnSubmit = document.getElementById('btnSubmit');
    if (agreeBox && btnSubmit) {
        agreeBox.addEventListener('change', () => {
            btnSubmit.disabled = !agreeBox.checked;
        });
    }
});

// --- DỮ LIỆU ĐỒNG BỘ ÂM LỊCH HỒ NGỌC ĐỨC (Năm 2024-2035) ---
const LNY_DATA = {
    2024: { date: new Date(2024, 1, 10), months: [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29], leap: 0, name: "Giáp Thìn" },
    2025: { date: new Date(2025, 0, 29), months: [29, 30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], leap: 6, name: "Ất Tỵ" }, // Nhuận tháng 6
    2026: { date: new Date(2026, 1, 17), months: [30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30], leap: 0, name: "Bính Ngọ" },
    2027: { date: new Date(2027, 1, 6), months: [29, 30, 29, 30, 29, 29, 30, 29, 30, 29, 30, 30], leap: 0, name: "Đinh Mùi" },
    2028: { date: new Date(2028, 0, 26), months: [30, 29, 30, 29, 30, 29, 29, 30, 29, 29, 30, 30, 29], leap: 5, name: "Mậu Thân" }, // Nhuận tháng 5
    2029: { date: new Date(2029, 1, 13), months: [30, 29, 30, 30, 29, 30, 29, 29, 30, 29, 30, 29], leap: 0, name: "Kỷ Dậu" },
    2030: { date: new Date(2030, 1, 3), months: [30, 30, 29, 30, 29, 30, 30, 29, 29, 30, 29, 30], leap: 0, name: "Canh Tuất" },
    2031: { date: new Date(2031, 0, 23), months: [29, 30, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30], leap: 3, name: "Tân Hợi" }, // Nhuận tháng 3
    2032: { date: new Date(2032, 1, 11), months: [29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29], leap: 0, name: "Nhâm Tý" },
    2033: { date: new Date(2033, 0, 31), months: [30, 29, 29, 30, 30, 29, 30, 30, 29, 30, 29, 30, 29], leap: 11, name: "Quý Sửu" }, // Nhuận tháng 11
    2034: { date: new Date(2034, 1, 19), months: [30, 29, 29, 30, 29, 30, 30, 29, 30, 30, 29, 30], leap: 0, name: "Giáp Dần" },
    2035: { date: new Date(2035, 1, 8), months: [29, 30, 29, 29, 30, 29, 30, 29, 30, 30, 30, 29], leap: 0, name: "Ất Mão" }
};

// Hàm chuyển đổi Dương Lịch -> Âm Lịch
function getLunarDate(solarDate) {
    let year = solarDate.getFullYear();
    if (year < 2024 || year > 2035) {
        return null;
    }
    
    let info = LNY_DATA[year];
    let lnyDate = info.date;
    
    if (solarDate < lnyDate) {
        year--;
        info = LNY_DATA[year];
        lnyDate = info.date;
    }
    
    let dSolar = new Date(solarDate.getFullYear(), solarDate.getMonth(), solarDate.getDate());
    let dLNY = new Date(lnyDate.getFullYear(), lnyDate.getMonth(), lnyDate.getDate());
    let diffDays = Math.round((dSolar - dLNY) / (1000 * 60 * 60 * 24));
    
    let months = info.months;
    let m = 0;
    while (diffDays >= months[m]) {
        diffDays -= months[m];
        m++;
    }
    
    let day = diffDays + 1;
    let month = m + 1;
    let isLeap = false;
    
    if (info.leap > 0) {
        if (m < info.leap) {
            month = m + 1;
        } else if (m === info.leap) {
            month = info.leap;
            isLeap = true;
        } else {
            month = m;
        }
    }
    
    return {
        day: day,
        month: month,
        isLeap: isLeap,
        yearName: info.name
    };
}

// Lấy thứ
function getDayOfWeekVN(date) {
    const days = ["chủ nhật", "thứ hai", "thứ ba", "thứ tư", "thứ năm", "thứ sáu", "thứ bảy"];
    return days[date.getDay()];
}

// --- SỰ KIỆN THAY ĐỔI NGÀY DƯƠNG LỊCH ---

// Lễ Gia Tiên
document.getElementById('date_le_solar').addEventListener('change', (e) => {
    if (!e.target.value) return;
    const date = new Date(e.target.value);
    
    document.getElementById('thu_le').value = getDayOfWeekVN(date);
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    document.getElementById('ngay_le_show').value = `ngày ${day} tháng ${month} năm ${year}`;
    
    document.getElementById('ngay_le').value = String(day);
    document.getElementById('thang_le').value = String(month);
    document.getElementById('nam_le').value = String(year);
    
    const lunar = getLunarDate(date);
    if (lunar) {
        let monthStr = `tháng ${lunar.month}`;
        if (lunar.isLeap) monthStr += " nhuận";
        document.getElementById('ngay_al_le_show').value = `ngày ${lunar.day} ${monthStr} năm ${lunar.yearName}`;
        
        document.getElementById('ngay_al_le').value = String(lunar.day);
        document.getElementById('thang_al_le').value = String(lunar.month) + (lunar.isLeap ? " nhuận" : "");
        document.getElementById('nam_al_le').value = lunar.yearName;
    } else {
        document.getElementById('ngay_al_le_show').value = "Chỉ hỗ trợ năm 2024-2035";
    }
});

// Tiệc Chiêu Đãi
document.getElementById('date_tiec_solar').addEventListener('change', (e) => {
    if (!e.target.value) return;
    const date = new Date(e.target.value);
    
    document.getElementById('thu_tiec').value = getDayOfWeekVN(date);
    
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    document.getElementById('ngay_tiec_show').value = `ngày ${day} tháng ${month} năm ${year}`;
    
    document.getElementById('ngay_tiec').value = String(day);
    document.getElementById('thang_tiec').value = String(month);
    document.getElementById('nam_tiec').value = String(year);
    
    const lunar = getLunarDate(date);
    if (lunar) {
        let monthStr = `tháng ${lunar.month}`;
        if (lunar.isLeap) monthStr += " nhuận";
        document.getElementById('ngay_al_tiec_show').value = `ngày ${lunar.day} ${monthStr} năm ${lunar.yearName}`;
    }
});

// Sinh mã đồng bộ W-XXXX
function generateSyncCode() {
    const chars = '0123456789';
    let code = 'W';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// --- GỬI DỮ LIỆU ---
document.getElementById('weddingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnSubmit = document.getElementById('btnSubmit');
    btnSubmit.disabled = true;
    btnSubmit.textContent = "Đang gửi dữ liệu...";
    
    try {
        const formData = new FormData(e.target);
        
        const details = {
            ONG_NHA_TRAI: formData.get('ONG_NHA_TRAI').trim(),
            BA_NHA_TRAI: formData.get('BA_NHA_TRAI').trim(),
            DC_NHA_TRAI: formData.get('DC_NHA_TRAI').trim(),
            ONG_NHA_GAI: formData.get('ONG_NHA_GAI').trim(),
            BA_NHA_GAI: formData.get('BA_NHA_GAI').trim(),
            DC_NHA_GAI: formData.get('DC_NHA_GAI').trim(),
            LOAI_LE: formData.get('LOAI_LE'),
            TEN_CHURE: formData.get('TEN_CHURE').trim(),
            VAI_VE_CHURE: formData.get('VAI_VE_CHURE').trim(),
            TEN_CODAU: formData.get('TEN_CODAU').trim(),
            VAI_VE_CODAU: formData.get('VAI_VE_CODAU').trim(),
            GIA_TIEN_TAI: formData.get('GIA_TIEN_TAI').trim(),
            GIO_LE: formData.get('GIO_LE').trim(),
            THU_LE: formData.get('THU_LE').trim(),
            NGAY_LE: formData.get('NGAY_LE').trim(),
            THANG_LE: formData.get('THANG_LE').trim(),
            NAM_LE: formData.get('NAM_LE').trim(),
            NGAY_AL_LE: formData.get('NGAY_AL_LE').trim(),
            THANG_AL_LE: formData.get('THANG_AL_LE').trim(),
            NAM_AL_LE: formData.get('NAM_AL_LE').trim(),
            TIEC_TAI: formData.get('TIEC_TAI').trim(),
            DC_TIEC: formData.get('DC_TIEC').trim(),
            GIO_TIEC: formData.get('GIO_TIEC').trim(),
            THU_TIEC: formData.get('THU_TIEC').trim(),
            NGAY_TIEC: formData.get('NGAY_TIEC').trim(),
            THANG_TIEC: formData.get('THANG_TIEC').trim(),
            NAM_TIEC: formData.get('NAM_TIEC').trim()
        };
        
        // Không sử dụng danh sách khách mời (bỏ phần 5)
        const guests = [];
        
        const code = generateSyncCode();
        const payload = {
            code: code,
            timestamp: new Date().toISOString(),
            details: details,
            guests: []
        };
        
        // Lưu vào localStorage (luôn thành công, không cần mạng)
        try {
            const saved = JSON.parse(localStorage.getItem('wedding_submissions') || '[]');
            saved.push(payload);
            localStorage.setItem('wedding_submissions', JSON.stringify(saved));
        } catch(e) { /* bỏ qua */ }
        
        // Thử gửi lên Firebase (không chặn nếu lỗi)
        try {
            await fetch(`${FIREBASE_DB_URL}/${code}.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch(e) { /* Không có Firebase cũng không sao */ }
        
        // Luôn hiện màn hình thành công + xuất ảnh
        const tenDauRe = (details.TEN_CHURE || '...') + ' ❤ ' + (details.TEN_CODAU || '...');
        document.getElementById('syncCode').textContent = tenDauRe;
        document.getElementById('weddingForm').classList.add('hidden');
        document.getElementById('successScreen').classList.remove('hidden');
        generateSummaryImage(details, code);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('successScreen').classList.remove('hidden');
        generateSummaryImage(details, code);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
    } catch (err) {
        alert("Có lỗi xảy ra: " + err.message);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Gửi Thông Tin In Thiệp Cưới";
    }
});

// --- VẼ ẢNH TỔNG HỢP THÔNG TIN THIỆP CƯỚI (Canvas API) ---
function generateSummaryImage(details, code) {
    const canvas = document.getElementById('summaryCanvas');
    const ctx = canvas.getContext('2d');
    
    // Kích thước chuẩn 9:16 cho điện thoại (1080x1920 pixel)
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;
    
    // --- Nền gradient hồng phấn ---
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, '#FFF2F5');
    bgGrad.addColorStop(1, '#FFE2E7');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
    
    // --- Trang trí góc ---
    ctx.fillStyle = 'rgba(255, 123, 144, 0.06)';
    ctx.beginPath();
    ctx.arc(0, 0, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W, H, 300, 0, Math.PI * 2);
    ctx.fill();
    
    // --- Tiêu đề ---
    let y = 80;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FF7B90';
    ctx.font = 'bold 52px Playfair Display, serif';
    ctx.fillText('Thiệp Cưới An Như', W / 2, y);
    
    y += 50;
    ctx.fillStyle = '#8C6D72';
    ctx.font = 'italic 28px Playfair Display, serif';
    ctx.fillText('Phiếu Thông Tin In Thiệp Cưới', W / 2, y);
    
    // --- Đường kẻ trang trí ---
    y += 35;
    ctx.strokeStyle = '#FED2DB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, y);
    ctx.lineTo(W - 200, y);
    ctx.stroke();
    
    // --- Mã đồng bộ ---
    y += 50;
    ctx.fillStyle = '#FF7B90';
    ctx.font = 'bold 36px Outfit, sans-serif';
    ctx.fillText('MÃ ĐỒNG BỘ: ' + code, W / 2, y);
    
    // --- Helper: Vẽ khối thông tin ---
    function drawSection(title, items, startY, bgColor) {
        let currentY = startY;
        
        // Tiêu đề section
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FF7B90';
        ctx.font = 'bold 32px Outfit, sans-serif';
        ctx.fillText(title, 80, currentY);
        
        currentY += 8;
        ctx.strokeStyle = '#FED2DB';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(80, currentY);
        ctx.lineTo(W - 80, currentY);
        ctx.stroke();
        
        currentY += 36;
        
        // Các dòng thông tin
        for (let item of items) {
            ctx.fillStyle = '#8C6D72';
            ctx.font = '26px Outfit, sans-serif';
            ctx.fillText(item.label + ':', 100, currentY);
            
            ctx.fillStyle = '#4C3034';
            ctx.font = 'bold 28px Outfit, sans-serif';
            
            // Tự xuống dòng nếu chữ quá dài
            const maxTextWidth = W - 120;
            let textValue = item.value || '—';
            let textWidth = ctx.measureText(textValue).width;
            
            if (textWidth > maxTextWidth - 100) {
                ctx.font = 'bold 24px Outfit, sans-serif';
            }
            
            ctx.fillText(textValue, 100, currentY + 34);
            currentY += 72;
        }
        
        return currentY;
    }
    
    // --- PHẦN 1: SONG THÂN ---
    y += 50;
    y = drawSection('HỌ NHÀ TRAI', [
        { label: 'Cha (Ông)', value: details.ONG_NHA_TRAI },
        { label: 'Mẹ (Bà)', value: details.BA_NHA_TRAI },
    ], y);
    
    y = drawSection('HỌ NHÀ GÁI', [
        { label: 'Cha (Ông)', value: details.ONG_NHA_GAI },
        { label: 'Mẹ (Bà)', value: details.BA_NHA_GAI },
    ], y + 10);
    
    // --- PHẦN 2: CÔ DÂU & CHÚ RỂ ---
    y = drawSection('CÔ DÂU & CHÚ RỂ', [
        { label: 'Chú Rể', value: details.TEN_CHURE + ' (' + details.VAI_VE_CHURE + ')' },
        { label: 'Cô Dâu', value: details.TEN_CODAU + ' (' + details.VAI_VE_CODAU + ')' },
    ], y + 10);
    
    // --- PHẦN 3: HÔN LỄ ---
    let leInfo = details.THU_LE + ', ngày ' + details.NGAY_LE + '/' + details.THANG_LE + '/' + details.NAM_LE;
    let leAL = '';
    if (details.NGAY_AL_LE) {
        leAL = '(AL: ' + details.NGAY_AL_LE + '/' + details.THANG_AL_LE + ' ' + details.NAM_AL_LE + ')';
    }
    
    y = drawSection(details.LOAI_LE || 'HÔN LỄ', [
        { label: 'Ngày', value: leInfo },
        { label: 'Âm lịch', value: leAL },
        { label: 'Giờ', value: details.GIO_LE },
        { label: 'Tại', value: details.GIA_TIEN_TAI },
    ], y + 10);
    
    // --- PHẦN 4: TIỆC CƯỚI ---
    let tiecInfo = details.THU_TIEC + ', ngày ' + details.NGAY_TIEC + '/' + details.THANG_TIEC + '/' + details.NAM_TIEC;
    
    y = drawSection('TIỆC CHIÊU ĐÃI', [
        { label: 'Ngày', value: tiecInfo },
        { label: 'Giờ', value: details.GIO_TIEC },
        { label: 'Địa điểm', value: details.TIEC_TAI },
        { label: 'Địa chỉ', value: details.DC_TIEC },
    ], y + 10);
    
    // --- Footer ---
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8C6D72';
    ctx.font = '22px Outfit, sans-serif';
    ctx.fillText('Thiệp Cưới An Như — thongtinthiepcuoi.com', W / 2, H - 50);
    
    // --- Xuất Canvas thành ảnh PNG và hiển thị ---
    const dataURL = canvas.toDataURL('image/png');
    const previewImg = document.getElementById('previewImg');
    previewImg.src = dataURL;
    
    // --- Chuyển dataURL thành File để chia sẻ ---
    function dataURLtoFile(dataurl, filename) {
        const arr = dataurl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) u8arr[n] = bstr.charCodeAt(n);
        return new File([u8arr], filename, { type: mime });
    }
    
    const fileName = `ThiepCuoi_${(details.TEN_CHURE || 'ChuRe').replace(/\s+/g, '_')}_${(details.TEN_CODAU || 'CoDau').replace(/\s+/g, '_')}.png`;
    const imageFile = dataURLtoFile(dataURL, fileName);
    
    // --- Nút Tải Ảnh (Tương thích điện thoại) ---
    document.getElementById('btnDownloadImg').onclick = async () => {
        // Cách 1: Web Share API (điện thoại) — mở menu Lưu/Chia sẻ
        if (navigator.canShare && navigator.canShare({ files: [imageFile] })) {
            try {
                await navigator.share({
                    title: 'Phiếu thông tin thiệp cưới',
                    files: [imageFile]
                });
                return;
            } catch (err) {
                // Người dùng hủy hoặc lỗi → thử cách khác
            }
        }
        
        // Cách 2: Tạo blob URL và tải (máy tính)
        try {
            const blob = await (await fetch(dataURL)).blob();
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = fileName;
            link.href = blobUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        } catch (err) {
            // Cách 3: Mở ảnh trên tab mới → nhấn giữ để lưu
            const newTab = window.open();
            if (newTab) {
                newTab.document.write(`
                    <html><head><title>Ảnh Thiệp Cưới</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#FFF2F5;flex-direction:column;font-family:sans-serif;}
                    img{max-width:95%;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.1);}
                    p{color:#8C6D72;margin-top:16px;font-size:14px;}</style></head>
                    <body><img src="${dataURL}"><p>📌 Nhấn giữ ảnh → Lưu ảnh về máy</p></body></html>
                `);
            }
        }
    };
}
