import styles from './activate.module.css'
import { useState } from 'react'

export default () => {
    const [key, setKey] = useState('')

    const onChange = (e) => {
        setKey(e.target.value)
    }

    const onClick = () => {
    }

    const activateEnabled = key.length > 30

    return <div className={styles.activate}>
        <label>Enter your license key</label>
        <input type="text" onChange={onChange} placeholder="6c9a23d-your-privacy-is-not-for-sale-and-should-never-be-up-for-debate"></input>
        <button onClick={onClick} disabled={!activateEnabled}>Activate</button>
    </div>
}