import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function LoginPage (props) {

    const UserStore = props.store;
    const completeProfile = typeof UserStore.name !== 'undefined';
    const { id } = useParams();

    // Checks if user exists
    // useEffect(() => {
        fetch(`/user/${id}`, { method: 'POST' }).then(res => res.json()).then(data => {
            console.log(data);
            if (data.error) throw(data);
            window.location.href='/user';
        }).catch(err => {
            window.location.href='/user?error=' + err.error;
        });
    // });
        
    return null;
}
