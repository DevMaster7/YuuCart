const crypto = require("crypto");

const algorithm = "aes-256-cbc";
// Use a fixed 32-byte key (for AES-256)
const secretKey = crypto.createHash("sha256").update("my-secret-password").digest();
// Use a fixed 16-byte IV
const iv = Buffer.from("1234567890123456"); // Must be 16 bytes

function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
}

function decrypt(encryptedText) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

module.exports = { encrypt, decrypt };