"use client"

import { useEffect, useState } from "react"
import styles from "./link-loader.module.css"

export default function LinkLoader() {
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setComplete(true), 950)
    return () => window.clearTimeout(timer)
  }, [])

  return <div className={`${styles.loader} ${complete ? styles.complete : ""}`} aria-hidden="true">
    <div className={styles.mark}><i /><span /><i /></div>
    <b>linkup</b>
  </div>
}
