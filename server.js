const express = require("express");
const multer = require("multer");

const app = express();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>File Upload</title>
        </head>
        <body>
            <h1>Upload a file</h1>

            <form action="/upload" method="POST" enctype="multipart/form-data">
                <input type="file" name="file" required>
                <button type="submit">Send to Discord</button>
            </form>
        </body>
        </html>
    `);
});

app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file selected.");
    }

    const webhook = process.env.DISCORD_WEBHOOK;

    if (!webhook) {
        return res.status(500).send("Discord webhook is not configured.");
    }

    const form = new FormData();

    form.append(
        "content",
        `Uploaded file: ${req.file.originalname}`
    );

    form.append(
        "file",
        new Blob([req.file.buffer]),
        req.file.originalname
    );

    try {
        const response = await fetch(webhook, {
            method: "POST",
            body: form
        });

        if (!response.ok) {
            const error = await response.text();
            console.error(error);
            return res.status(500).send("Discord rejected the upload.");
        }

        res.send("File successfully sent to Discord.");
    } catch (error) {
        console.error(error);
        res.status(500).send("Upload failed.");
    }
});

const port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", () => {
    console.log(`Listening on port ${port}`);
});
