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

// Test
const encrypted = encrypt("cart-of-user Starts with Name of Allah");
console.log("Encrypted:", encrypted);

const decrypted = decrypt("3b69245e0a79ac1f3e7c129ab7cf29a49a7676f1f5f75cdcf934ed95d909a9aa823ac80ebf0c11d9efe6f44fffb07df5");
console.log("Decrypted:", decrypted);
