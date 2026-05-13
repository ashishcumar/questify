import styles from "./Footer.module.css";

const TOOLS = [
  { name: "Calc",     href: "https://calc.renderlog.in",     emoji: "🧮" },
  { name: "PDF",      href: "https://pdf.renderlog.in",      emoji: "📄" },
  { name: "Image",    href: "https://image.renderlog.in",    emoji: "🖼️" },
  { name: "JSON",     href: "https://json.renderlog.in",     emoji: "📦" },
  { name: "Text",     href: "https://text.renderlog.in",     emoji: "📝" },
  { name: "Notepad",  href: "https://notepad.renderlog.in",  emoji: "🗒️" },
  { name: "QR",       href: "https://qr.renderlog.in",       emoji: "◼️" },
  { name: "Renderlog",href: "https://renderlog.in",          emoji: "🌐" },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.label}>More tools by Renderlog</p>
        <div className={styles.tools}>
          {TOOLS.map((tool) => (
            <a
              key={tool.name}
              href={tool.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.tool}
            >
              <span className={styles.toolEmoji}>{tool.emoji}</span>
              <span>{tool.name}</span>
            </a>
          ))}
        </div>
        <p className={styles.copy}>
          Built by{" "}
          <a href="https://github.com/ashishcumar" target="_blank" rel="noopener noreferrer">
            Ashish Kumar
          </a>{" "}
          · questify is MIT-licensed open source
        </p>
      </div>
    </footer>
  );
}
