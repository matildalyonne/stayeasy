import styles from './Spinner.module.css'

export default function Spinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        <div className={styles.spinner} />
      </div>
    )
  }
  return <div className={styles.spinner} />
}
