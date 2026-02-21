# Contributing to NoVerify

Thank you for your interest in contributing to NoVerify! 🎉

## How to Contribute

### 1. Fork & Clone
```bash
git fork https://github.com/yourusername/noverifyweb
git clone https://github.com/yourusername/noverifyweb.git
cd noverifyweb
npm install
npm run dev
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes
- Follow existing code style (React functional components, inline styles for consistency)
- Test your changes with `npm run build` (must pass with zero errors)
- Keep components focused and reusable

### 4. Commit & Push
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 5. Open a Pull Request
- Describe what your PR does
- Include screenshots for UI changes
- Reference any related issues

## Code Style
- **React**: Functional components with hooks
- **Styling**: Inline styles with the existing dark theme color palette
- **Colors**: Gold `#c9a84c`, Light `#f0ece2`, Muted `#a09e96`, Dark BG `#0a0a0f`
- **Fonts**: Playfair Display (headings), Inter (body)

## Reporting Bugs
Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## License
By contributing, you agree that your contributions will be licensed under the MIT License.
