# Backend Implementation Guide for High-Quality Panel Image Generation

## Overview

This guide provides complete backend implementation details for generating high-quality panel images with dialogue bubbles server-side. The frontend sends panel data and the backend generates and stores rendered images.

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Database Schema Updates](#database-schema-updates)
3. [Image Generation Implementation](#image-generation-implementation)
4. [Queue System](#queue-system)
5. [Storage Integration](#storage-integration)
6. [Complete Code Examples](#complete-code-examples)

---

## API Endpoints

### 1. Update Panel with Rendered Image

```javascript
// POST /api/panels/:id/save-with-image
app.post(
  "/api/panels/:id/save-with-image",
  upload.single("renderedImage"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const panelData = JSON.parse(req.body.panelData);
      const renderedImageFile = req.file;

      // Update panel with dialog data
      const updatedPanel = await Panel.findByIdAndUpdate(
        id,
        {
          dialogs: panelData.dialogs,
          // ... other panel fields
        },
        { new: true }
      );

      // If rendered image provided, upload and update renderedImgUrl
      if (renderedImageFile) {
        const imageUrl = await uploadImageToStorage(renderedImageFile);
        updatedPanel.renderedImgUrl = imageUrl;
        await updatedPanel.save();
      }

      res.json({
        success: true,
        panel: updatedPanel,
        message: renderedImageFile
          ? "Panel saved with rendered image"
          : "Panel saved with dialogs only",
      });
    } catch (error) {
      console.error("Error saving panel:", error);
      res.status(500).json({ error: "Failed to save panel" });
    }
  }
);
```

### 2. Generate Rendered Image (Async)

```javascript
// POST /api/panels/:id/generate-image
app.post("/api/panels/:id/generate-image", async (req, res) => {
  try {
    const { id } = req.params;
    const panel = await Panel.findById(id);

    if (!panel) {
      return res.status(404).json({ error: "Panel not found" });
    }

    // Add to background job queue
    await imageGenerationQueue.add("generate-panel-image", {
      panelId: id,
      panel: panel.toObject(),
    });

    res.json({
      success: true,
      message: "Image generation started",
      jobId: `panel-${id}-${Date.now()}`,
    });
  } catch (error) {
    console.error("Error starting image generation:", error);
    res.status(500).json({ error: "Failed to start image generation" });
  }
});
```

---

## Database Schema Updates

### MongoDB/Mongoose Schema

```javascript
const panelSchema = new mongoose.Schema({
  // Existing fields
  _id: mongoose.Schema.Types.ObjectId,
  order: Number,
  imgUrl: String, // Original panel image
  dialogs: [
    {
      _id: String,
      order: Number,
      content: String,
      emotion: String,
      speakerId: String,
      bubbleType: String,
      panelId: String,
      config: {
        c: { x: Number, y: Number },
        w: Number,
        h: Number,
        config: {
          fontSize: Number,
          textColor: String,
          fontWeight: String,
          backgroundColor: String,
          borderColor: String,
          borderWidth: Number,
          borderRadius: Number,
        },
      },
    },
  ],

  // NEW FIELD for rendered image
  renderedImgUrl: {
    type: String,
    default: null,
    description: "URL of high-quality rendered image with dialogs",
  },

  // Generation status tracking
  renderingStatus: {
    type: String,
    enum: ["pending", "processing", "completed", "failed"],
    default: null,
  },

  renderedAt: {
    type: Date,
    default: null,
  },
});
```

### SQL Schema (if using SQL database)

```sql
-- Add new columns to panels table
ALTER TABLE panels ADD COLUMN rendered_img_url VARCHAR(500) DEFAULT NULL;
ALTER TABLE panels ADD COLUMN rendering_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT NULL;
ALTER TABLE panels ADD COLUMN rendered_at TIMESTAMP DEFAULT NULL;

-- Index for performance
CREATE INDEX idx_panels_rendering_status ON panels(rendering_status);
```

---

## Image Generation Implementation

### Option 1: Using Puppeteer (Recommended)

```javascript
const puppeteer = require("puppeteer");

class PanelImageGenerator {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async generatePanelImage(panel) {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser.newPage();

    try {
      // Set viewport for high quality
      await page.setViewport({
        width: 1600,
        height: 1200,
        deviceScaleFactor: 2,
      });

      // Create HTML template
      const html = this.createPanelHTML(panel);
      await page.setContent(html);

      // Wait for images to load
      await page.waitForLoadState("networkidle");

      // Take screenshot of the canvas element
      const canvasElement = await page.$("#panel-canvas");
      const imageBuffer = await canvasElement.screenshot({
        type: "png",
        quality: 100,
      });

      return imageBuffer;
    } finally {
      await page.close();
    }
  }

  createPanelHTML(panel) {
    const bubbleTypes = {
      normal: { image: "/images/bubbles/normal-rounded.png", color: "#ffffff" },
      thought: { image: "/images/bubbles/thought.png", color: "#f0f0f0" },
      scream: { image: "/images/bubbles/screem.png", color: "#ffe6e6" },
      whisper: {
        image: "/images/bubbles/normal-rounded.png",
        color: "#e6f3ff",
      },
      narration: {
        image: "/images/bubbles/normal-rectangle.png",
        color: "#fff9e6",
      },
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 20px; background: #f0f0f0; }
    #panel-canvas {
      position: relative;
      width: 800px;
      height: 600px;
      background-image: url('${panel.imgUrl}');
      background-size: cover;
      background-position: center;
    }
    .bubble {
      position: absolute;
      background-size: 100% 100%;
      background-repeat: no-repeat;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      word-wrap: break-word;
    }
    .bubble-text {
      padding: 10px;
      max-width: 80%;
      max-height: 80%;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div id="panel-canvas">
    ${panel.dialogs
      .map((dialog) => {
        const bubbleType = bubbleTypes[dialog.bubbleType] || bubbleTypes.normal;
        const config = dialog.config?.config || {};

        return `
        <div class="bubble" style="
          left: ${dialog.config?.c?.x || 0}px;
          top: ${dialog.config?.c?.y || 0}px;
          width: ${dialog.config?.w || 160}px;
          height: ${dialog.config?.h || 100}px;
          background-image: url('${bubbleType.image}');
          font-size: ${config.fontSize || 16}px;
          color: ${config.textColor || "#000000"};
          font-weight: ${config.fontWeight || "normal"};
        ">
          <div class="bubble-text">${dialog.content || ""}</div>
        </div>
      `;
      })
      .join("")}
  </div>
</body>
</html>
    `;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
```

### Option 2: Using node-canvas

```javascript
const { createCanvas, loadImage } = require("canvas");

class CanvasPanelGenerator {
  async generatePanelImage(panel) {
    const SCALE_FACTOR = 2;
    const baseWidth = 800;
    const baseHeight = 600;

    const canvas = createCanvas(
      baseWidth * SCALE_FACTOR,
      baseHeight * SCALE_FACTOR
    );
    const ctx = canvas.getContext("2d");

    // Enable high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.scale(SCALE_FACTOR, SCALE_FACTOR);

    // Load and draw panel background
    const panelImage = await loadImage(panel.imgUrl);
    ctx.drawImage(panelImage, 0, 0, baseWidth, baseHeight);

    // Draw bubbles
    for (const dialog of panel.dialogs || []) {
      await this.drawBubble(ctx, dialog);
    }

    return canvas.toBuffer("image/png");
  }

  async drawBubble(ctx, dialog) {
    const bubbleTypes = {
      normal: "/images/bubbles/normal-rounded.png",
      thought: "/images/bubbles/thought.png",
      scream: "/images/bubbles/screem.png",
      narration: "/images/bubbles/normal-rectangle.png",
    };

    const x = dialog.config?.c?.x || 0;
    const y = dialog.config?.c?.y || 0;
    const width = dialog.config?.w || 160;
    const height = dialog.config?.h || 100;
    const config = dialog.config?.config || {};

    try {
      // Draw bubble background
      const bubbleImagePath =
        bubbleTypes[dialog.bubbleType] || bubbleTypes.normal;
      const bubbleImage = await loadImage(bubbleImagePath);
      ctx.drawImage(bubbleImage, x, y, width, height);
    } catch (error) {
      // Fallback: draw colored rectangle
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
    }

    // Draw text
    const fontSize = config.fontSize || 16;
    const fontWeight = config.fontWeight || "normal";
    const textColor = config.textColor || "#000000";

    ctx.fillStyle = textColor;
    ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Text positioning based on bubble type
    const textArea = this.getTextArea(dialog.bubbleType, x, y, width, height);

    if (dialog.content) {
      const lines = this.wrapText(ctx, dialog.content, textArea.maxWidth);
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;
      const startY = textArea.y - totalHeight / 2 + lineHeight / 2;

      lines.forEach((line, index) => {
        const lineY = startY + index * lineHeight;
        if (lineY >= y && lineY <= y + height) {
          ctx.fillText(line, textArea.x, lineY);
        }
      });
    }
  }

  getTextArea(bubbleType, x, y, width, height) {
    switch (bubbleType) {
      case "normal":
        return {
          x: x + width * 0.5,
          y: y + height * 0.45,
          maxWidth: width * 0.8,
        };
      case "thought":
        return {
          x: x + width * 0.52,
          y: y + height * 0.4,
          maxWidth: width * 0.7,
        };
      case "scream":
        return {
          x: x + width * 0.5,
          y: y + height * 0.5,
          maxWidth: width * 0.7,
        };
      case "narration":
        return {
          x: x + width * 0.5,
          y: y + height * 0.37,
          maxWidth: width * 0.9,
        };
      default:
        return {
          x: x + width * 0.5,
          y: y + height * 0.45,
          maxWidth: width * 0.8,
        };
    }
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}
```

---

## Queue System Implementation

### Using Bull Queue (Redis-based)

```javascript
const Queue = require("bull");
const redis = require("redis");

// Create queue
const imageGenerationQueue = new Queue("panel image generation", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Initialize generator
const generator = new PanelImageGenerator();

// Process jobs
imageGenerationQueue.process("generate-panel-image", async (job) => {
  const { panelId, panel } = job.data;

  try {
    // Update status to processing
    await Panel.findByIdAndUpdate(panelId, {
      renderingStatus: "processing",
    });

    // Generate image
    const imageBuffer = await generator.generatePanelImage(panel);

    // Upload to storage
    const imageUrl = await uploadImageToStorage(
      imageBuffer,
      `panel-${panelId}.png`
    );

    // Update panel with rendered image URL
    await Panel.findByIdAndUpdate(panelId, {
      renderedImgUrl: imageUrl,
      renderingStatus: "completed",
      renderedAt: new Date(),
    });

    return { success: true, imageUrl };
  } catch (error) {
    // Update status to failed
    await Panel.findByIdAndUpdate(panelId, {
      renderingStatus: "failed",
    });

    throw error;
  }
});

// Queue events
imageGenerationQueue.on("completed", (job, result) => {
  console.log(`Panel image generated: ${job.data.panelId}`);
});

imageGenerationQueue.on("failed", (job, err) => {
  console.error(`Panel image generation failed: ${job.data.panelId}`, err);
});
```

---

## Storage Integration

### AWS S3 Integration

```javascript
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function uploadImageToStorage(imageBuffer, filename) {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `panels/rendered/${filename}`,
    Body: imageBuffer,
    ContentType: "image/png",
    ACL: "public-read",
  };

  const result = await s3.upload(params).promise();
  return result.Location;
}
```

### Cloudinary Integration

```javascript
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImageToStorage(imageBuffer, filename) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        public_id: `panels/rendered/${filename}`,
        format: "png",
        quality: "auto:best",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    uploadStream.end(imageBuffer);
  });
}
```

---

## Complete Integration Example

### Main Service File

```javascript
const express = require("express");
const multer = require("multer");
const Panel = require("./models/Panel");
const PanelImageGenerator = require("./services/PanelImageGenerator");
const imageGenerationQueue = require("./queues/imageGeneration");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const imageGenerator = new PanelImageGenerator();

// Initialize generator
imageGenerator.initialize();

// Save panel with optional rendered image
app.post(
  "/api/panels/:id/save",
  upload.single("renderedImage"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const panelData =
        typeof req.body.panel === "string"
          ? JSON.parse(req.body.panel)
          : req.body.panel;

      // Update panel data
      const updatedPanel = await Panel.findByIdAndUpdate(
        id,
        {
          dialogs: panelData.dialogs,
          // ... other fields
        },
        { new: true }
      );

      // If frontend sent rendered image, upload it
      if (req.file) {
        const imageUrl = await uploadImageToStorage(
          req.file.buffer,
          `panel-${id}.png`
        );
        updatedPanel.renderedImgUrl = imageUrl;
        updatedPanel.renderingStatus = "completed";
        updatedPanel.renderedAt = new Date();
        await updatedPanel.save();
      }
      // If no image but has dialogs, generate image in background
      else if (panelData.dialogs && panelData.dialogs.length > 0) {
        await imageGenerationQueue.add("generate-panel-image", {
          panelId: id,
          panel: updatedPanel.toObject(),
        });
        updatedPanel.renderingStatus = "pending";
        await updatedPanel.save();
      }

      res.json({
        success: true,
        panel: updatedPanel,
        message: req.file
          ? "Panel saved with rendered image"
          : panelData.dialogs?.length > 0
          ? "Panel saved, image generation queued"
          : "Panel saved",
      });
    } catch (error) {
      console.error("Error saving panel:", error);
      res.status(500).json({ error: "Failed to save panel" });
    }
  }
);

// Get panel with rendering status
app.get("/api/panels/:id", async (req, res) => {
  try {
    const panel = await Panel.findById(req.params.id);
    if (!panel) {
      return res.status(404).json({ error: "Panel not found" });
    }

    res.json({
      success: true,
      panel,
      hasRenderedImage: !!panel.renderedImgUrl,
      renderingStatus: panel.renderingStatus,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch panel" });
  }
});

// Regenerate panel image
app.post("/api/panels/:id/regenerate-image", async (req, res) => {
  try {
    const panel = await Panel.findById(req.params.id);
    if (!panel) {
      return res.status(404).json({ error: "Panel not found" });
    }

    // Clear existing rendered image
    panel.renderedImgUrl = null;
    panel.renderingStatus = "pending";
    await panel.save();

    // Queue for regeneration
    await imageGenerationQueue.add("generate-panel-image", {
      panelId: panel._id,
      panel: panel.toObject(),
    });

    res.json({
      success: true,
      message: "Image regeneration queued",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to queue image regeneration" });
  }
});

module.exports = app;
```

---

## Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/manga-ai
# or for SQL
DATABASE_URL=postgresql://user:password@localhost:5432/manga-ai

# Redis (for queue)
REDIS_HOST=localhost
REDIS_PORT=6379

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=manga-ai-assets

# Cloudinary (alternative to S3)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# App
NODE_ENV=production
PORT=3001
```

---

## Package Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "multer": "^1.4.5",
    "puppeteer": "^21.0.0",
    "canvas": "^2.11.0",
    "bull": "^4.10.0",
    "redis": "^4.6.0",
    "aws-sdk": "^2.1400.0",
    "cloudinary": "^1.40.0",
    "mongoose": "^7.4.0"
  }
}
```

---

## Testing the Implementation

### Test Script

```javascript
// test-image-generation.js
const PanelImageGenerator = require("./services/PanelImageGenerator");

async function testImageGeneration() {
  const generator = new PanelImageGenerator();
  await generator.initialize();

  const testPanel = {
    _id: "test-panel",
    imgUrl: "https://example.com/panel.jpg",
    dialogs: [
      {
        content: "Hello World!",
        bubbleType: "normal",
        config: {
          c: { x: 100, y: 100 },
          w: 160,
          h: 100,
          config: {
            fontSize: 16,
            textColor: "#000000",
            fontWeight: "normal",
          },
        },
      },
    ],
  };

  try {
    const imageBuffer = await generator.generatePanelImage(testPanel);
    require("fs").writeFileSync("test-output.png", imageBuffer);
    console.log("✅ Image generated successfully!");
  } catch (error) {
    console.error("❌ Error generating image:", error);
  } finally {
    await generator.close();
  }
}

testImageGeneration();
```

---

## Deployment Considerations

### Docker Configuration

```dockerfile
# Dockerfile for image generation service
FROM node:18-slim

# Install dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxss1 \
    libxtst6 \
    xdg-utils

# Set Puppeteer to use installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001
CMD ["node", "server.js"]
```

### Performance Optimization

1. **Browser Pool**: Maintain a pool of browser instances for Puppeteer
2. **Caching**: Cache frequently used bubble images
3. **Queue Priority**: Prioritize recent panel updates
4. **Rate Limiting**: Prevent excessive generation requests
5. **Monitoring**: Track generation times and success rates

---

## Summary

This implementation provides:

- ✅ High-quality server-side image generation
- ✅ Async processing with queue system
- ✅ Multiple storage options (S3, Cloudinary)
- ✅ Fallback rendering options (Puppeteer, node-canvas)
- ✅ Complete API endpoints
- ✅ Database schema updates
- ✅ Error handling and status tracking
- ✅ Docker deployment ready

The backend will handle all image generation, allowing the frontend to focus on the editing experience while ensuring high-quality output for panel viewing.
