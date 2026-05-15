import styles from "./Footer.module.css";

const TOOLS = [
  { name: "Calc",     href: "https://calc.renderlog.in",     icon: "/tool-icons/calc.svg" },
  { name: "PDF",      href: "https://pdf.renderlog.in",      icon: "/tool-icons/pdf.svg" },
  { name: "Image",    href: "https://image.renderlog.in",    icon: "/tool-icons/image.svg" },
  { name: "JSON",     href: "https://json.renderlog.in",     icon: "/tool-icons/json.svg" },
  { name: "Text",     href: "https://text.renderlog.in",     icon: "/tool-icons/text.svg" },
  { name: "Notepad",  href: "https://notepad.renderlog.in",  icon: "/tool-icons/notepad.svg" },
  { name: "QR",       href: "https://qr.renderlog.in",       icon: "/tool-icons/qr.svg" },
  { name: "Renderlog", href: "https://renderlog.in",         icon: "/tool-icons/renderlog.svg" },
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
              <img
                src={tool.icon}
                alt=""
                width={18}
                height={18}
                className={styles.toolIcon}
                aria-hidden
              />
              <span>{tool.name}</span>
            </a>
          ))}
        </div>
        <p className={styles.copy}>
          Built by{" "}
          <a href="https://github.com/ashishcumar" target="_blank" rel="noopener noreferrer">
            Ashish Kumar
          </a>{" "}
          · Questify (@questify/core) is MIT-licensed open source
        </p>
      </div>
    </footer>
  );
}
