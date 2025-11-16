import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const frames = {
  none: {
    draw: (ctx, x, y, width, height) => { }, // Empty function for no frame
  },
  pastel: {
    draw: (ctx, x, y, width, height) => {
      const drawSticker = (x, y, type) => {
        switch (type) {
          case 'star':
            ctx.fillStyle = "#FFD700";
            ctx.beginPath();
            ctx.arc(x, y, 12, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 'heart':
            ctx.fillStyle = "#cc8084";
            ctx.beginPath();
            const heartSize = 22;
            ctx.moveTo(x, y + heartSize / 4);
            ctx.bezierCurveTo(x, y, x - heartSize / 2, y, x - heartSize / 2, y + heartSize / 4);
            ctx.bezierCurveTo(x - heartSize / 2, y + heartSize / 2, x, y + heartSize * 0.75, x, y + heartSize);
            ctx.bezierCurveTo(x, y + heartSize * 0.75, x + heartSize / 2, y + heartSize / 2, x + heartSize / 2, y + heartSize / 4);
            ctx.bezierCurveTo(x + heartSize / 2, y, x, y, x, y + heartSize / 4);
            ctx.fill();
            break;
          case 'flower':
            ctx.fillStyle = "#FF9BE4";
            for (let i = 0; i < 5; i++) {
              ctx.beginPath();
              const angle = (i * 2 * Math.PI) / 5;
              ctx.ellipse(
                x + Math.cos(angle) * 10,
                y + Math.sin(angle) * 10,
                8, 8, 0, 0, 2 * Math.PI
              );
              ctx.fill();
            }
            // Center of flower
            ctx.fillStyle = "#FFE4E1";
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, 2 * Math.PI);
            ctx.fill();
            break;
          case 'bow':
            ctx.fillStyle = "#f9cee7";
            // Left loop
            ctx.beginPath();
            ctx.ellipse(x - 10, y, 10, 6, Math.PI / 4, 0, 2 * Math.PI);
            ctx.fill();
            // Right loop
            ctx.beginPath();
            ctx.ellipse(x + 10, y, 10, 6, -Math.PI / 4, 0, 2 * Math.PI);
            ctx.fill();
            // Center knot
            ctx.fillStyle = "#e68bbe";
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            break;
        }
      };

      // Top left corner
      drawSticker(x + 11, y + 5, 'bow');
      drawSticker(x - 18, y + 95, 'heart');

      // Top right corner
      drawSticker(x + width - 160, y + 10, 'star');
      drawSticker(x + width - 1, y + 50, 'heart');

      // Bottom left corner
      drawSticker(x + 120, y + height - 20, 'heart');
      drawSticker(x + 20, y + height - 20, 'star');

      // Bottom right corner
      drawSticker(x + width - 125, y + height - 5, 'bow');
      drawSticker(x + width - 10, y + height - 45, 'heart');
    }
  },


  cute: {
    draw: (ctx, x, y, width, height) => {
      const drawStar = (centerX, centerY, size, color = "#FFD700") => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const point = i === 0 ? 'moveTo' : 'lineTo';
          ctx[point](
            centerX + size * Math.cos(angle),
            centerY + size * Math.sin(angle)
          );
        }
        ctx.closePath();
        ctx.fill();
      };

      const drawCloud = (centerX, centerY) => {
        ctx.fillStyle = "#87CEEB";
        const cloudParts = [
          { x: 0, y: 0, r: 14 },
          { x: -6, y: 2, r: 10 },
          { x: 6, y: 2, r: 10 },
        ];
        cloudParts.forEach(part => {
          ctx.beginPath();
          ctx.arc(centerX + part.x, centerY + part.y, part.r, 0, Math.PI * 2);
          ctx.fill();
        });
      };

      // Draw decorations around the frame
      // Top corners
      drawStar(x + 150, y + 18, 15, "#FFD700");
      drawCloud(x + 20, y + 5);
      drawStar(x + width - 1, y + 45, 12, "#FF69B4");
      drawCloud(x + width - 80, y + 5);

      // Bottom corners
      drawCloud(x + 150, y + height - 5);
      drawStar(x + 0, y + height - 65, 15, "#9370DB");
      drawCloud(x + width - 5, y + height - 85);
      drawStar(x + width - 120, y + height - 5, 12, "#40E0D0");
    }
  },

  // Custom PNG sticker frame
  custom: {
    draw: (ctx, x, y, width, height, stickerImages) => {
      if (!stickerImages || !stickerImages.sticker) return;

      const sticker = stickerImages.sticker;

      // Draw sticker at top left - sticker already has proper size for frame
      ctx.drawImage(sticker, x, y);
    }
  }
};

const PhotoPreview = ({ capturedImages }) => {
  const stripCanvasRef = useRef(null);
  const navigate = useNavigate();
  const [stripColor, setStripColor] = useState("white");
  const [selectedFrame, setSelectedFrame] = useState("none");
  const [logoImage, setLogoImage] = useState(null);
  const [stickerImages, setStickerImages] = useState({});

  // Load logo image
  useEffect(() => {
    const img = new Image();
    img.src = '/logo.png'; // Place your logo.png in the public folder
    img.onload = () => setLogoImage(img);
  }, []);

  // Load sticker images for custom frame
  useEffect(() => {
    const img = new Image();
    img.src = '/sticker_fun.png';
    img.onload = () => setStickerImages({ sticker: img });
    img.onerror = () => console.log('Sticker not found');
  }, []);


  const generatePhotoStrip = useCallback(() => {
    const canvas = stripCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");


    const imgWidth = 400;
    const imgHeight = 300;
    const borderSize = 40;
    const photoSpacing = 20;
    const textHeight = 50;
    const totalHeight = (imgHeight * 4) + (photoSpacing * 3) + (borderSize * 2) + textHeight;

    canvas.width = imgWidth + borderSize * 2;
    canvas.height = totalHeight;

    ctx.fillStyle = stripColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let imagesLoaded = 0;
    capturedImages.forEach((image, index) => {
      const img = new Image();
      img.src = image;
      img.onload = () => {
        const yOffset = borderSize + (imgHeight + photoSpacing) * index;

        const imageRatio = img.width / img.height;
        const targetRatio = imgWidth / imgHeight;

        let sourceWidth = img.width;
        let sourceHeight = img.height;
        let sourceX = 0;
        let sourceY = 0;

        if (imageRatio > targetRatio) {
          sourceWidth = sourceHeight * targetRatio;
          sourceX = (img.width - sourceWidth) / 2;
        } else {
          sourceHeight = sourceWidth / targetRatio;
          sourceY = (img.height - sourceHeight) / 2;
        }

        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight,
          borderSize, yOffset, imgWidth, imgHeight
        );

        if (frames[selectedFrame] && typeof frames[selectedFrame].draw === 'function') {
          if (selectedFrame === 'custom') {
            frames[selectedFrame].draw(
              ctx,
              borderSize,
              yOffset,
              imgWidth,
              imgHeight,
              stickerImages
            );
          } else {
            frames[selectedFrame].draw(
              ctx,
              borderSize,
              yOffset,
              imgWidth,
              imgHeight
            );
          }
        }

        imagesLoaded++;

        if (imagesLoaded === capturedImages.length && logoImage) {
          // Draw logo at the bottom (logo is 1024x1024)
          const logoSize = 100; // Square logo size
          const logoX = (canvas.width - logoSize) / 2;
          const logoY = totalHeight - borderSize - 60;

          ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        }
      };
    });
  }, [capturedImages, stripColor, selectedFrame, logoImage, stickerImages]);

  useEffect(() => {
    if (capturedImages.length === 4 && logoImage) {
      setTimeout(() => {
        generatePhotoStrip();
      }, 100);
    }
  }, [capturedImages, stripColor, selectedFrame, logoImage, generatePhotoStrip]);

  const downloadPhotoStrip = () => {
    // Create a new canvas for download with duplicated layout
    const downloadCanvas = document.createElement("canvas");
    const downloadCtx = downloadCanvas.getContext("2d");

    const originalCanvas = stripCanvasRef.current;

    // New dimensions: width will be 2x (left + right duplicate)
    downloadCanvas.width = originalCanvas.width * 2;
    downloadCanvas.height = originalCanvas.height;

    // Draw original strip on the left
    downloadCtx.drawImage(originalCanvas, 0, 0);

    // Draw duplicate on the right
    downloadCtx.drawImage(originalCanvas, originalCanvas.width, 0);

    const link = document.createElement("a");
    link.download = "photostrip.png";
    link.href = downloadCanvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="photo-preview">
      <div className="preview-layout">
        {/* Left column - Background colors */}
        <div className="preview-sidebar">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', textAlign: 'center' }}>Warna Background</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setStripColor("white")} className={stripColor === "white" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Putih</button>
            <button onClick={() => setStripColor("#fceee9")} className={stripColor === "#fceee9" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Pink</button>
            <button onClick={() => setStripColor("#dde6d5")} className={stripColor === "#dde6d5" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Hijau</button>
            <button onClick={() => setStripColor("#adc3e5")} className={stripColor === "#adc3e5" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Biru</button>
            <button onClick={() => setStripColor("#FFF2CC")} className={stripColor === "#FFF2CC" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Kuning</button>
            <button onClick={() => setStripColor("#dbcfff")} className={stripColor === "#dbcfff" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Ungu</button>
          </div>
        </div>

        {/* Second left column - Ornaments */}
        <div className="preview-sidebar">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', textAlign: 'center' }}>Ornamen</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={() => setSelectedFrame("none")} className={selectedFrame === "none" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Tanpa</button>
            <button onClick={() => setSelectedFrame("pastel")} className={selectedFrame === "pastel" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Girlypop</button>
            <button onClick={() => setSelectedFrame("cute")} className={selectedFrame === "cute" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Awan</button>
            <button onClick={() => setSelectedFrame("custom")} className={selectedFrame === "custom" ? "active" : ""} style={{ padding: '10px 16px', fontSize: '0.9rem', width: '100%' }}>Seru</button>
          </div>
        </div>

        {/* Center - Canvas preview */}
        <div className="preview-center">
          <canvas ref={stripCanvasRef} className="photo-strip" />
        </div>

        {/* Right sidebar for actions */}
        <div className="preview-sidebar">
          <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', textAlign: 'center' }}>Aksi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={downloadPhotoStrip} style={{ padding: '15px 20px', fontSize: '1rem', width: '100%' }}>
              📥 Unduh Photo Strip
            </button>
            <button onClick={() => navigate("/")} style={{ padding: '15px 20px', fontSize: '1rem', width: '100%' }}>
              🔄 Foto Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoPreview;