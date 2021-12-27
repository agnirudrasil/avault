import {NextPage} from 'next'
import {Avatar, Badge} from '@mui/material'
import {useEffect, useState} from "react";

const EvilPNG: NextPage = () => {
    const [count, setCount] = useState(1);
    useEffect(() => {
        setTimeout(() => {

            setInterval(() => {
                setCount(prev => prev + 1)
            }, 100)
        }, 2000)
    }, [])
    return <div style={{display: "grid", placeItems: "center", height: "100vh"}}>
        <Badge anchorOrigin={{
            vertical: "bottom", horizontal: "right"
        }} overlap="circular" badgeContent={count} color="error">
            <Avatar src="/Discord-Logo-Color.png"/>
        </Badge>
    </div>
}

export default EvilPNG