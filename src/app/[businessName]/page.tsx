'use server'
import React from 'react'

export default async function page({ params }: { params: { businessName: string } }) {
    const getBusinessData = async (businessName: string) => {
        try {
            const result = await fetch(`http://127.0.0.1:3000/api/businessUsers/${businessName}`, {
                cache: 'force-cache'
            });
            if (result.status === 401 || result.status === 400) {
                const res = await result.json()
                console.log(`Something went wrong: ${res.result}`);
                return null
            }
            const data = await result.json();
            return data;
        } catch (error: any) {
            console.error(`Error: ${error.message}`)
            return null
        }
    }
    // const { businessName } = params;
    // const result = getBusinessData(businessName);
    // console.log(result)

    return (
        <div>
            <p>Hope this works :)</p>
        </div>
    )
}
