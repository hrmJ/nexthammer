import React from 'react'
import Action from './action'

const launch = (tst) => {
    console.log("launching fr list: " + tst)
}


export default  ( {corpus} ) => {

    return (

        <Action name={'Frequency list'} action={launch.bind(null, "Test")} >

        Frequency lists are... Well, you know what they are.

        </Action>
    )

}
