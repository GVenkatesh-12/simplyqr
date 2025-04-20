document.addEventListener('DOMContentLoaded', () => {
    const qrText = document.getElementById('qrText');
    const format = document.getElementById('format');
    const transparentBg = document.getElementById('transparentBg');
    const bgColor = document.getElementById('bgColor');
    const qrStyle = document.getElementById('qrStyle');
    const qrColor = document.getElementById('qrColor');
    const size = document.getElementById('size');
    const sizeValue = document.getElementById('sizeValue');
    const logo = document.getElementById('logo');
    const logoFileName = document.getElementById('logoFileName');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const qrCode = document.getElementById('qrCode');

    let currentQRCode = null;

    // Update size value display
    size.addEventListener('input', () => {
        sizeValue.textContent = `${size.value}px`;
    });

    // Handle logo file selection
    logo.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            logoFileName.textContent = e.target.files[0].name;
        } else {
            logoFileName.textContent = 'Choose Logo';
        }
    });

    // Generate QR code
    generateBtn.addEventListener('click', async () => {
        const text = qrText.value.trim();
        if (!text) {
            alert('Please enter some text or URL');
            return;
        }

        const options = {
            width: parseInt(size.value),
            height: parseInt(size.value),
            color: {
                dark: qrColor.value,
                light: transparentBg.checked ? '#ffffff00' : bgColor.value
            },
            margin: 1,
            quality: 1,
            errorCorrectionLevel: 'H'
        };

        try {
            // Clear previous QR code
            qrCode.innerHTML = '';

            // Create a canvas element
            const canvas = document.createElement('canvas');
            qrCode.appendChild(canvas);

            // Generate new QR code
            await QRCode.toCanvas(canvas, text, options);
            currentQRCode = canvas;

            // Apply style based on selection
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            if (qrStyle.value === 'dots') {
                // Convert squares to dots
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
                        // This is a black pixel
                        const x = (i / 4) % canvas.width;
                        const y = Math.floor((i / 4) / canvas.width);
                        
                        // Draw a circle
                        ctx.beginPath();
                        ctx.arc(x, y, 2, 0, Math.PI * 2);
                        ctx.fillStyle = qrColor.value;
                        ctx.fill();
                    }
                }
            } else if (qrStyle.value === 'rounded') {
                // Round the corners of squares
                for (let i = 0; i < data.length; i += 4) {
                    if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
                        const x = (i / 4) % canvas.width;
                        const y = Math.floor((i / 4) / canvas.width);
                        
                        // Draw a rounded rectangle
                        ctx.beginPath();
                        ctx.roundRect(x - 2, y - 2, 4, 4, 2);
                        ctx.fillStyle = qrColor.value;
                        ctx.fill();
                    }
                }
            }

            // Add logo if selected
            if (logo.files.length > 0) {
                const logoFile = logo.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const logoImg = new Image();
                    logoImg.src = e.target.result;
                    logoImg.onload = () => {
                        const logoSize = canvas.width / 4;
                        const logoX = (canvas.width - logoSize) / 2;
                        const logoY = (canvas.height - logoSize) / 2;
                        
                        // Draw white background for logo
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(logoX - 5, logoY - 5, logoSize + 10, logoSize + 10);
                        
                        // Draw logo
                        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
                    };
                };
                reader.readAsDataURL(logoFile);
            }

            // Enable download button
            downloadBtn.disabled = false;
        } catch (error) {
            console.error('Error generating QR code:', error);
            alert('Error generating QR code: ' + error.message);
        }
    });

    // Download QR code
    downloadBtn.addEventListener('click', () => {
        if (!currentQRCode) return;

        const link = document.createElement('a');
        link.download = `qr-code.${format.value}`;
        link.href = currentQRCode.toDataURL(`image/${format.value}`);
        link.click();
    });

    // Handle style changes
    qrStyle.addEventListener('change', () => {
        if (currentQRCode) {
            generateBtn.click();
        }
    });

    // Handle color changes
    qrColor.addEventListener('change', () => {
        if (currentQRCode) {
            generateBtn.click();
        }
    });

    // Handle background color changes
    bgColor.addEventListener('change', () => {
        if (currentQRCode) {
            generateBtn.click();
        }
    });

    // Handle transparent background toggle
    transparentBg.addEventListener('change', () => {
        bgColor.disabled = transparentBg.checked;
        if (currentQRCode) {
            generateBtn.click();
        }
    });
}); 
