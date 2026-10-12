# NOVA SHOP & Secure Password Studio

A modern, responsive e-commerce landing page with a built-in cryptographic Password Studio.

## ✨ Features

- **E-Commerce Showcase**: Premium dark/light aesthetic, responsive product grid, and interactive shopping cart.
- **Cryptographic Password Generator**:
  - Uses `window.crypto.getRandomValues()` for genuine entropy.
  - Customizable length (8 to 32 characters, default 8).
  - Character set toggles: Numbers, Symbols (`?><{}[]!@#`), Capital Letters, and Lowercase.
  - Real-time password strength meter (Weak, Medium, Strong, Military-grade).
  - One-click copy with visual toast feedback.
  - Validation: Prevents generation if no character sets are selected with helpful feedback.
  - Monospace font and password visibility toggle.

## 🚀 Getting Started

Simply open `index.html` in any modern web browser or serve locally:

```bash
python -m http.server 8080
```
Then visit [http://localhost:8080](http://localhost:8080).

## 🛠️ Built With

- HTML5
- CSS3 (Vanilla, custom design system)
- JavaScript (Vanilla ES6+)
