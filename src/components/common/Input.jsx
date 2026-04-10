import styles from './Input.module.css'

export default function Input({ label, error, helpText, icon, ...props }) {
  return (
    <div className={styles.group}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          className={`${styles.input} ${icon ? styles.withIcon : ''} ${error ? styles.hasError : ''}`}
          {...props}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {helpText && !error && <p className={styles.help}>{helpText}</p>}
    </div>
  )
}
