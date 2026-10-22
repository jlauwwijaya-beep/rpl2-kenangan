window.drawCollage = async function(canvasRef, photoUrls, layout, bgColor, padding) {
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const layouts = {
        '2x2': { cols: 2, rows: 2 },
        '3x3': { cols: 3, rows: 3 },
        '2x3': { cols: 3, rows: 2 },
        '4x1': { cols: 4, rows: 1 },
        '1x4': { cols: 1, rows: 4 },
        'asymmetric': { cols: 2, rows: 2, custom: true }
    };
    
    const layoutConfig = layouts[layout] || layouts['2x2'];
    const cols = layoutConfig.cols;
    const rows = layoutConfig.rows;
    
    const cellWidth = (canvas.width - padding * (cols + 1)) / cols;
    const cellHeight = (canvas.height - padding * (rows + 1)) / rows;
    
    let photoIndex = 0;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (photoIndex >= photoUrls.length) break;
            
            const x = padding + col * (cellWidth + padding);
            const y = padding + row * (cellHeight + padding);
            
            await drawImageInCell(ctx, photoUrls[photoIndex], x, y, cellWidth, cellHeight);
            photoIndex++;
        }
    }
};

window.drawFrame = async function(canvasRef, photoUrl, frameStyle, frameColor, borderWidth, caption) {
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const photoWidth = canvas.width - borderWidth * 2;
    const photoHeight = photoWidth * 0.75;
    const photoX = borderWidth;
    const photoY = borderWidth;
    
    ctx.fillStyle = frameColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (frameStyle === 'neon') {
        ctx.shadowColor = frameColor;
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    } else if (frameStyle === 'shadow') {
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(photoX, photoY, photoWidth, photoHeight);
    
    await drawImageInCell(ctx, photoUrl, photoX + 2, photoY + 2, photoWidth - 4, photoHeight - 4);
    
    if (caption) {
        ctx.fillStyle = '#333333';
        ctx.font = 'bold 16px "Plus Jakarta Sans"';
        ctx.textAlign = 'center';
        ctx.fillText(caption, canvas.width / 2, photoY + photoHeight + 40);
    }
};

window.drawPolaroid = async function(canvasRef, photoUrl, bottomText, dateText, textStyle, rotation) {
    const canvas = canvasRef;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    const polaroidBg = '#f5f1e8';
    ctx.fillStyle = polaroidBg;
    ctx.fillRect(20, 20, canvas.width - 40, canvas.height - 40);
    
    ctx.shadowColor = 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 4;
    
    const photoW = canvas.width - 60;
    const photoH = 300;
    await drawImageInCell(ctx, photoUrl, 30, 30, photoW, photoH);
    
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#333333';
    
    if (textStyle === 'handwritten') {
        ctx.font = 'italic 14px "Playfair Display"';
    } else if (textStyle === 'typewriter') {
        ctx.font = '13px "Courier New", monospace';
    } else if (textStyle === 'marker') {
        ctx.font = 'bold 15px marker-felt';
    } else {
        ctx.font = '14px "Plus Jakarta Sans"';
    }
    
    ctx.textAlign = 'left';
    ctx.fillText(bottomText, 40, canvas.height - 60);
    
    if (dateText) {
        ctx.font = '10px "Plus Jakarta Sans"';
        ctx.fillText(dateText, 40, canvas.height - 35);
    }
    
    ctx.restore();
};

async function drawImageInCell(ctx, imageUrl, x, y, width, height) {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const imgRatio = img.width / img.height;
            const cellRatio = width / height;
            
            let srcX, srcY, srcW, srcH;
            
            if (imgRatio > cellRatio) {
                srcH = img.height;
                srcW = img.height * cellRatio;
                srcX = (img.width - srcW) / 2;
                srcY = 0;
            } else {
                srcW = img.width;
                srcH = img.width / cellRatio;
                srcX = 0;
                srcY = (img.height - srcH) / 2;
            }
            
            ctx.drawImage(img, srcX, srcY, srcW, srcH, x, y, width, height);
            resolve();
        };
        img.onerror = () => resolve();
        img.src = imageUrl;
    });
}

window.downloadCanvas = function(canvasRef, filename) {
    const canvas = canvasRef;
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
};
